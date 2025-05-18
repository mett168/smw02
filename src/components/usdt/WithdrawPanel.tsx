"use client";

import { useState } from "react";
import { SmartWallet } from "thirdweb/wallets";
import { sendTransaction, prepareContractCall } from "thirdweb";
import { getUSDTContract } from "@/utils/getUSDTContract";
import { supabase } from "@/lib/supabaseClient";

export default function WithdrawPanel({ wallet }: { wallet: SmartWallet }) {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("1.0");

  const handleWithdraw = async () => {
    console.log("[0] 출금 버튼 클릭됨");

    if (!toAddress || !/^0x[a-fA-F0-9]{40}$/.test(toAddress)) {
      console.warn("[1] 유효하지 않은 주소");
      setStatus("❌ 받는 주소를 확인하세요");
      return;
    }

    const amountNumber = Number(amount);
    if (isNaN(amountNumber) || amountNumber <= 0) {
      console.warn("[1-2] 유효하지 않은 금액");
      setStatus("❌ 금액을 다시 입력하세요");
      return;
    }

    setLoading(true);
    setStatus("출금 처리 중...");

    try {
      console.log("[2] SmartWallet 계정 요청");
      const account = await wallet.getAccount();
      const userAddress = account.address.toLowerCase();
      console.log("[3] SmartWallet 주소:", userAddress);

      console.log("[4] USDT 컨트랙트 인스턴스 요청");
      const usdtContract = getUSDTContract();
      console.log("[5] USDT 컨트랙트 주소:", usdtContract.address);

      const amountInWei = BigInt(Math.floor(amountNumber * 10 ** 6));
      console.log("[6] 금액 변환 완료 (wei):", amountInWei.toString());

      console.log("[7] prepareContractCall 실행");
      const tx = prepareContractCall({
        contract: usdtContract,
        method: "function transfer(address _to, uint256 _value) returns (bool)",
        params: [toAddress, amountInWei],
      });

      console.log("[8] sendTransaction 실행 (🚀 gasless: 운영자 대납)");
      const result = await sendTransaction({
        account,
        transaction: tx,
        gasless: { provider: "thirdweb" },
      });

      console.log("[9] 트랜잭션 성공:", result.transactionHash);
      setStatus(`✅ 출금 성공! TX: ${result.transactionHash}`);

      // ✅ Supabase 기록 - wallet_address + ref_code 저장
      console.log("[10] Supabase 기록 시작");
      let refCode = "unknown";
      try {
        const { data: user } = await supabase
          .from("users")
          .select("ref_code")
          .eq("wallet_address", userAddress)
          .single();

        if (user?.ref_code) {
          refCode = user.ref_code;
        }
      } catch (err) {
        console.warn("❌ ref_code 조회 실패:", err);
      }

      console.log("[📦 기록용 wallet_address]", userAddress);
      console.log("[📦 기록용 ref_code]", refCode);
      console.log("[📦 기록용 amount]", amountNumber);
      console.log("[📦 기록용 tx_hash]", result.transactionHash);

      const insertResult = await supabase.from("usdt_history").insert([
        {
          wallet_address: userAddress,
          ref_code: refCode,
          direction: "out",
          amount: amountNumber,
          tx_hash: result.transactionHash,
          status: "completed",
        },
      ]);

      if (insertResult.error) {
        console.error("[❌ Supabase 기록 실패]", insertResult.error);
        setStatus(`⚠️ 기록 실패: ${insertResult.error.message}`);
      } else {
        console.log("[✅ Supabase 기록 성공]");
      }
    } catch (err: any) {
      console.error("[X] 출금 오류 발생:", {
        message: err.message,
        details: err.details,
        stack: err.stack,
      });
      setStatus(`❌ 실패: ${err.details || err.message}`);
    } finally {
      console.log("[11] 처리 완료");
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white shadow-md rounded max-w-md mx-auto">
      <h2 className="text-lg font-semibold mb-4">USDT 출금</h2>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">받는 주소</label>
          <input
            type="text"
            placeholder="0x..."
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">금액 (USDT)</label>
          <input
            type="number"
            placeholder="1.0"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={handleWithdraw}
          disabled={loading}
          className={`w-full py-2 px-4 rounded text-white font-medium ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "처리 중..." : "출금 실행"}
        </button>
        {status && (
          <div
            className={`p-3 rounded text-sm ${
              status.includes("✅")
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {status}
          </div>
        )}
      </div>
    </div>
  );
}
