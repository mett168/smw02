import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// 오늘 날짜 YYYY-MM-DD 문자열 반환
function getTodayDate() {
  const now = new Date();
  return now.toISOString().split("T")[0]; // '2025-05-16'
}

export async function POST() {
  const today = getTodayDate();

  // 1. 모든 유저 데이터 불러오기
  const { data: users, error: userError } = await supabase
    .from("users")
    .select("ref_code, ref_by, wallet_address, name, created_at");

  if (userError) {
    return NextResponse.json({ error: "유저 데이터 로드 실패", detail: userError }, { status: 500 });
  }

  const summaries = [];
  const histories = [];

  for (const user of users) {
    const refCode = user.ref_code;

    // 📌 NFT 보유량 계산 (wallet_address 기준)
    const { data: nftData } = await supabase
      .from("nfts")
      .select("type, quantity")
      .eq("wallet_address", user.wallet_address);

    const nftCounts = {
      nft300: 0,
      nft3000: 0,
      nft10000: 0,
    };

    for (const nft of nftData || []) {
      if (nft.type === "nft300") nftCounts.nft300 += nft.quantity;
      if (nft.type === "nft3000") nftCounts.nft3000 += nft.quantity;
      if (nft.type === "nft10000") nftCounts.nft10000 += nft.quantity;
    }

    // 📌 오늘 받은 리워드 계산
    const { data: rewardToday } = await supabase
      .from("rewards")
      .select("amount")
      .eq("ref_by", user.ref_by)
      .eq("ref_code", refCode)
      .eq("reward_type", "referral")
      .gte("minted_at", `${today}T00:00:00`)
      .lte("minted_at", `${today}T23:59:59`);

    const todayReward = (rewardToday || []).reduce((sum, r) => sum + Number(r.amount), 0);

    // 📌 누적 리워드 계산
    const { data: rewardTotal } = await supabase
      .from("rewards")
      .select("amount")
      .eq("ref_by", user.ref_by)
      .eq("ref_code", refCode)
      .eq("reward_type", "referral");

    const totalReward = (rewardTotal || []).reduce((sum, r) => sum + Number(r.amount), 0);

    // 📌 invite_summaries 업서트
    summaries.push({
      ref_code: user.ref_code,
      ref_by: user.ref_by,
      wallet_address: user.wallet_address,
      name: user.name,
      created_at: user.created_at,
      nft300: nftCounts.nft300,
      nft3000: nftCounts.nft3000,
      nft10000: nftCounts.nft10000,
      today_reward: todayReward,
      total_reward: totalReward,
      updated_at: new Date().toISOString(),
    });

    // 📌 invite_summary_history insert
    histories.push({
      summary_date: today,
      ref_code: user.ref_code,
      invitees_code: user.ref_code,
      wallet_address: user.wallet_address,
      name: user.name,
      created_at: user.created_at,
      nft300: nftCounts.nft300,
      nft3000: nftCounts.nft3000,
      nft10000: nftCounts.nft10000,
      reward_today: todayReward,
      reward_total: totalReward,
      recorded_at: new Date().toISOString(),
    });
  }

  // ✅ DB 저장
  await supabase.from("invite_summaries").upsert(summaries, { onConflict: "ref_code" });
  await supabase.from("invite_summary_history").insert(histories);

  return NextResponse.json({ success: true, count: summaries.length });
}
