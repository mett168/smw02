import { prepareContractCall, sendTransaction } from "thirdweb";
import { polygon } from "thirdweb/chains";
import { client } from "@/client";
import { SmartWallet } from "thirdweb/wallets";

const USDT_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";

const ERC20_ABI = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "recipient", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "success", type: "bool" }],
  },
];

export async function withdrawUSDT({
  wallet,
  toAddress,
  amount,
}: {
  wallet: SmartWallet;
  toAddress: string;
  amount: number;
}) {
  console.log("📌 [1] 출금 함수 호출됨");
  console.log("➡️ 출금 대상 주소:", toAddress);
  console.log("➡️ 출금 금액:", amount);

  if (!wallet) {
    console.error("❌ [2] 지갑 객체 없음");
    throw new Error("지갑이 연결되지 않았습니다.");
  }

  const account = await wallet.getAccount();
  const address = account?.address;
  if (!address) {
    console.error("❌ [3] 스마트 지갑 주소 없음");
    throw new Error("스마트 지갑이 아직 생성되지 않았습니다.");
  }

  console.log("✅ [2-1] 스마트 지갑 주소:", address);

  if (!/^0x[a-fA-F0-9]{40}$/.test(toAddress)) {
    console.error("❌ [4] 잘못된 주소 형식");
    throw new Error("올바른 지갑 주소 형식이 아닙니다.");
  }

  if (amount <= 0) {
    console.error("❌ [5] 금액 오류");
    throw new Error("출금 금액은 0보다 커야 합니다.");
  }

  try {
    const amountInWei = amount * 1e6;
    console.log("💰 [6] 전송할 금액 (wei):", amountInWei);

    const txRequest = prepareContractCall({
      contractAddress: USDT_ADDRESS,
      abi: ERC20_ABI,
      functionName: "transfer",
      args: [toAddress, amountInWei],
      chain: polygon,
      client,
    });

    console.log("📦 [7] 트랜잭션 전송 준비 완료");

    const tx = await sendTransaction({
      account,
      transaction: txRequest,
    });

    console.log("🚀 [8] 트랜잭션 전송 완료");
    console.log("🔗 트랜잭션 해시:", tx.receipt.transactionHash);
    return tx;
  } catch (error: any) {
    console.error("🔥 [9] 출금 중 오류 발생:", error?.message || error);
    throw new Error(`출금 중 오류 발생: ${error?.message || error}`);
  }
}
