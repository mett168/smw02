// src/lib/getOnchainNFTBalances.ts

import { readContract } from "thirdweb";
import { client } from "@/client";
import { polygon } from "thirdweb/chains";
import { supabase } from "@/lib/supabaseClient";

const CONTRACTS = {
  nft300: {
    address: "0xc925cd3fbbc506b69204fe97329c6b2b33d17f99",
    tokenId: 1,
  },
  nft3000: {
    address: "0xc925cd3fbbc506b69204fe97329c6b2b33d17f99",
    tokenId: 2,
  },
  nft10000: {
    address: "0xc925cd3fbbc506b69204fe97329c6b2b33d17f99",
    tokenId: 3,
  },
};

export async function getOnchainNFTBalances(
  userAddress: string,
  refCode: string,
  refBy: string,
  centerId: string
) {
  const balances: Record<string, number> = {
    nft300: 0,
    nft3000: 0,
    nft10000: 0,
  };

  if (!userAddress || userAddress.length !== 42) {
    console.error("❌ 잘못된 지갑 주소:", userAddress);
    return balances;
  }

  const lowerAddress = userAddress.toLowerCase();
  console.log("📍[1] NFT 잔고 조회 시작 - 주소:", lowerAddress);

  try {
    for (const [type, { address, tokenId }] of Object.entries(CONTRACTS)) {
      const result = await readContract({
        contract: {
          client,
          chain: polygon,
          address,
        },
        method: "function balanceOf(address account, uint256 id) view returns (uint256)",
        params: [lowerAddress, tokenId],
      });

      const count = Number(result);
      balances[type] = count;
      localStorage.setItem(type, String(count));
      console.log(`✅ [2] ${type} 수량:`, count);
    }

    // ✅ nfts 테이블에 기존 행 존재 여부 확인 (ref_code 기준)
    const { data: existing, error: fetchError } = await supabase
      .from("nfts")
      .select("id")
      .eq("ref_code", refCode)
      .maybeSingle();

    if (fetchError) {
      console.error("❌ NFT row fetch 실패", fetchError);
      return balances;
    }

    const nftRow = {
      wallet_address: lowerAddress,
      ref_code: refCode,
      ref_by: refBy,
      center_id: centerId,
      nft300: balances.nft300,
      nft3000: balances.nft3000,
      nft10000: balances.nft10000,
    };

    if (existing?.id) {
      // ✅ update
      const { error: updateError } = await supabase
        .from("nfts")
        .update(nftRow)
        .eq("id", existing.id);

      if (updateError) {
        console.error("❌ NFT 업데이트 실패", updateError);
      } else {
        console.log("✅ NFT 보유량 업데이트 완료");
      }
    } else {
      // ✅ insert
      const { error: insertError } = await supabase.from("nfts").insert([nftRow]);

      if (insertError) {
        console.error("❌ NFT 신규 저장 실패", insertError);
      } else {
        console.log("✅ NFT 보유량 신규 저장 완료");
      }
    }
  } catch (err) {
    console.error("❌ NFT 조회 중 오류 발생:", err);
  }

  console.log("📦 [5] 최종 NFT 잔고:", balances);
  return balances;
}
