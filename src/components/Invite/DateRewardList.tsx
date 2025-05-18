import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useActiveAccount } from "thirdweb/react";

interface RewardRow {
  created_at: string;
  amount: number;
  type: string;
}

export default function DateRewardList() {
  const account = useActiveAccount();
  const [rewards, setRewards] = useState<RewardRow[]>([]);

  useEffect(() => {
    const fetchRewards = async () => {
      if (!account?.address) return;

      const { data } = await supabase
        .from("rewards")
        .select("created_at, amount, type")
        .eq("to_wallet", account.address.toLowerCase())
        .order("created_at", { ascending: false });

      if (data) setRewards(data);
    };
    fetchRewards();
  }, [account]);

  return (
    <ul className="text-sm text-gray-800 divide-y">
      {rewards.map((r, i) => (
        <li key={i} className="flex justify-between py-2">
          <span>{new Date(r.created_at).toLocaleDateString()}</span>
          <span>{r.amount.toFixed(2)} USDT ({r.type})</span>
        </li>
      ))}
      {rewards.length === 0 && <li className="py-4 text-center text-gray-400">리워드 기록이 없습니다.</li>}
    </ul>
  );
}