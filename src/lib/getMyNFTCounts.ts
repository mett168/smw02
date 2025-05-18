import { supabase } from "@/lib/supabaseClient";

export async function getMyNFTCounts(userId: string) {
  const { data, error } = await supabase
    .from("nfts")
    .select("type, quantity")
    .eq("user_id", userId);

  if (error || !data) {
    console.error("❌ NFT 수량 조회 실패:", error);
    return {
      nft300: 0,
      nft3000: 0,
      nft10000: 0,
    };
  }

  const result: Record<string, number> = {
    nft300: 0,
    nft3000: 0,
    nft10000: 0,
  };

  for (const item of data) {
    if (result[item.type] !== undefined) {
      result[item.type] = item.quantity;
    }
  }

  return result;
}
