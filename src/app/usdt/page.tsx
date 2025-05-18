'use client';

import { useState, useEffect, useMemo } from 'react';
import { useActiveAccount, useActiveWallet } from 'thirdweb/react';
import { SmartWallet } from 'thirdweb/wallets';
import { polygon } from 'thirdweb/chains';
import { getContract } from 'thirdweb';
import { balanceOf } from 'thirdweb/extensions/erc20';
import { client } from '@/client';

import DepositPanel from '@/components/usdt/DepositPanel';
import WithdrawPanel from '@/components/usdt/WithdrawPanel';

const USDT_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";

export default function UsdtPage() {
  const account = useActiveAccount();
  const activeWallet = useActiveWallet();
  const wallet = activeWallet as SmartWallet; // ✅ SmartWallet으로 타입 캐스팅

  const [tab, setTab] = useState<"deposit" | "withdraw">("deposit");
  const [balance, setBalance] = useState("0.00");

  const contract = useMemo(() => {
    return getContract({
      client,
      chain: polygon,
      address: USDT_ADDRESS,
    });
  }, []);

  const fetchBalance = async () => {
    if (!account?.address) return;
    try {
      const result = await balanceOf({ contract, address: account.address });
      setBalance((Number(result) / 1e6).toFixed(2));
    } catch (err) {
      console.error("❌ USDT 잔액 조회 실패:", err);
      setBalance("0.00");
    }
  };

  useEffect(() => {
    fetchBalance();
    const interval = setInterval(fetchBalance, 10000); // 10초마다 갱신
    return () => clearInterval(interval);
  }, [account, contract]);

  return (
    <main className="min-h-screen bg-[#f5f7fa] p-4 pb-20 max-w-md mx-auto">
      <h2 className="text-center text-lg font-semibold mb-2">USDT 잔액</h2>
      <div className="bg-white rounded shadow text-center py-4 mb-4">
        <p className="text-2xl font-bold text-green-600">{balance} USDT</p>
      </div>

      {/* 탭 전환 버튼 */}
      <div className="flex mb-4 rounded overflow-hidden">
        <button
          onClick={() => setTab("deposit")}
          className={`flex-1 py-2 text-sm font-semibold ${tab === "deposit" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
        >
          입금
        </button>
        <button
          onClick={() => setTab("withdraw")}
          className={`flex-1 py-2 text-sm font-semibold ${tab === "withdraw" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
        >
          출금
        </button>
      </div>

      {/* 탭 내용 */}
      {tab === "deposit" ? (
        <DepositPanel account={account} />
      ) : (
        <WithdrawPanel
          wallet={wallet}
          onWithdrawComplete={() => {
            fetchBalance();
            alert("출금 완료!");
          }}
        />
      )}
    </main>
  );
}
