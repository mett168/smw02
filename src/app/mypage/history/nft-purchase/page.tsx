"use client";

import { useEffect, useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import TopBar from "@/components/TopBar";
import { supabase } from "@/lib/supabaseClient";

export default function NftInHistoryPage() {
  const account = useActiveAccount();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!account?.address) return;

      // 유저 ref_code 조회
      const { data: userData } = await supabase
        .from("users")
        .select("ref_code")
        .eq("wallet_address", account.address.toLowerCase())
        .maybeSingle();

      if (!userData?.ref_code) {
        setLoading(false);
        return;
      }

      const { data: history } = await supabase
        .from("nft_transfers")
        .select("*")
        .eq("ref_code", userData.ref_code)
        .eq("direction", "in")
        .eq("purpose", "normal")
        .order("created_at", { ascending: false });

      setRecords(history || []);
      setLoading(false);
    };

    fetchData();
  }, [account]);

  return (
    <>
      <TopBar title="NFT 입금 내역" showBack />
      <main className="p-4 max-w-md mx-auto bg-[#f5f7fa] min-h-screen pb-24">
        {loading ? (
          <p className="text-sm text-gray-500 text-center">불러오는 중...</p>
        ) : records.length === 0 ? (
          <p className="text-sm text-gray-500 text-center">입금 내역이 없습니다.</p>
        ) : (
          <ul className="space-y-3">
            {records.map((item, idx) => (
              <li key={idx} className="bg-white rounded-xl p-4 shadow text-sm">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">{item.nft_type}</span>
                  <span className="font-semibold">+ {item.quantity} 개</span>
                </div>
                <div className="text-gray-400 text-xs">
                  {new Date(item.created_at).toLocaleString()}
                </div>
                <div className="text-blue-600 text-xs truncate mt-1">
                  <a
                    href={`https://polygonscan.com/tx/${item.tx_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    트랜잭션 보기 ↗
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
