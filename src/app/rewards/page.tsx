// app/rewards/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import { supabase } from "@/lib/supabaseClient";
import { format } from "date-fns";
import BottomNav from "@/components/BottomNav";

export default function RewardsPage() {
  const account = useActiveAccount();
  const [rewardLogs, setRewardLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRewards = async () => {
      if (!account?.address) return;

      const { data, error } = await supabase
        .from("rewards_log")
        .select("*")
        .eq("wallet_address", account.address)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("⛔ 리워드 불러오기 실패:", error);
      } else {
        setRewardLogs(data || []);
      }

      setLoading(false);
    };

    fetchRewards();
  }, [account]);

  return (
    <main className="min-h-screen bg-[#f5f7fa] pb-20 px-4 pt-6 max-w-md mx-auto">
      <h1 className="text-xl font-semibold text-blue-700 mb-4">리워드 내역</h1>

      {loading ? (
        <p className="text-gray-500 text-sm">불러오는 중...</p>
      ) : rewardLogs.length === 0 ? (
        <p className="text-gray-500 text-sm">리워드 내역이 없습니다.</p>
      ) : (
        <ul className="space-y-3">
          {rewardLogs.map((log) => (
            <li key={log.id} className="bg-white shadow rounded-xl p-4">
              <p className="text-sm text-gray-700">
                📅 {format(new Date(log.created_at), "yyyy-MM-dd")}
              </p>
              <p className="text-lg font-bold text-[#00C8B3]">
                +{log.reward_amount} USDT
              </p>
              {log.tx_hash && (
                <a
                  href={`https://polygonscan.com/tx/${log.tx_hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 underline mt-1 inline-block"
                >
                  트랜잭션 보기 ↗
                </a>
              )}
            </li>
          ))}
        </ul>
      )}

      <BottomNav />
    </main>
  );
}
