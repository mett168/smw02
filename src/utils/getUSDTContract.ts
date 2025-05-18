import { getContract } from "thirdweb";
import { polygon } from "thirdweb/chains";
import { client } from "@/client";
import { usdtAbi } from "./usdtAbi";
import { Abi } from "viem"; // ✅ 핵심 추가

export function getUSDTContract() {
  return getContract({
    client,
    chain: polygon,
    address: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f", // Polygon USDT
    abi: usdtAbi as Abi, // ✅ 타입 강제 명시로 prepareContractCall 오류 방지
  });
}











