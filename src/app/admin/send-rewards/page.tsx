// src/app/admin/send-rewards/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useActiveAccount, ConnectButton } from "thirdweb/react";
import { sendRewardUSDT } from "@/lib/sendRewardUSDT";
import { supabase } from "@/lib/supabaseClient";

export default function SendRewardsPage() {
  const account = useActiveAccount();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    console.log("🔍 현재 Smart Wallet 상태:", account);
  }, [account]);

  const handleSend = async () => {
    if (!account || !account.address) {
      console.error("❌ Smart Wallet에 연결되어 있지 않습니다.");
      return;
    }

    console.log("✅ 버튼 클릭됨 → 전송 시작");

    setLoading(true);
    setDone(false);

    try {
      const { data: rewards, error } = await supabase
        .from("rewards")
        .select("id, user_id, amount, type, source_id")
        .is("tx_hash", null);

      if (error || !rewards) {
        console.error("❌ 리워드 불러오기 실패:", error);
        return;
      }

      for (const reward of rewards) {
        const { data: user } = await supabase
          .from("users")
          .select("wallet_address")
          .eq("id", reward.user_id)
          .maybeSingle();

        if (!user?.wallet_address) continue;

        await sendRewardUSDT({
          fromAccount: account,
          toAddress: user.wallet_address,
          amount: Number(reward.amount),
          userId: reward.user_id,
          rewardType: reward.type,
          sourceUserId: reward.source_id,
          rewardId: reward.id,
        });
      }

      setDone(true);
    } catch (err) {
      console.error("❌ 리워드 전송 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow">
        <h1 className="text-xl font-bold mb-4">리워드 수동 지급</h1>
        <ConnectButton client={undefined} />
        <button
          onClick={handleSend}
          disabled={loading}
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {loading ? "전송 중..." : "미지급 리워드 전송"}
        </button>
        {done && <p className="text-green-600 mt-4">✅ 전송 완료!</p>}
      </div>
    </main>
  );
}
