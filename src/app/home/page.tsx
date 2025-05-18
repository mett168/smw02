"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useActiveAccount } from "thirdweb/react";
import { getContract } from "thirdweb";
import { balanceOf } from "thirdweb/extensions/erc20";
import { polygon } from "thirdweb/chains";
import { Home, Copy } from "lucide-react";

import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { getOnchainNFTBalances } from "@/lib/getOnchainNFTBalances";
import { client } from "@/client";
import { supabase } from "@/lib/supabaseClient";
import { useSession } from "@supabase/auth-helpers-react";

const USDT_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";

export default function HomePage() {
  const account = useActiveAccount();
  const address = account?.address?.toLowerCase() || "0x0000000000000000000000000000000000000000";
  const session = useSession();
  const router = useRouter();
  const balanceCalled = useRef(false);

  const [usdtBalance, setUsdtBalance] = useState("조회 중...");
  const [nickname, setNickname] = useState("");
  const [name, setName] = useState("");
  const [nftBalances, setNftBalances] = useState({ nft300: 0, nft3000: 0, nft10000: 0 });
  const [investReward, setInvestReward] = useState(0);
  const [referralReward, setReferralReward] = useState(0);

  const usdtContract = useMemo(() => getContract({ client, chain: polygon, address: USDT_ADDRESS }), []);

  const fetchUSDTBalance = async () => {
    if (!account?.address) return;

    try {
      const result = await balanceOf({ contract: usdtContract, address: account.address });
      const formatted = (Number(result) / 1e6).toFixed(2);
      const current = parseFloat(formatted);
      const prev = parseFloat(localStorage.getItem("usdt_balance") || "0");

      const alreadyRecorded = localStorage.getItem("last_recorded_balance");
      if (alreadyRecorded === formatted || current === prev) {
        setUsdtBalance(`${formatted} USDT`);
        return;
      }

      if (current > prev) {
        const walletAddress = account.address.toLowerCase();
        localStorage.setItem("usdt_balance", formatted);
        localStorage.setItem("last_recorded_balance", formatted);
        let refCode = "unknown";
        const diff = Number((current - prev).toFixed(2));

        try {
          const { data: user } = await supabase
            .from("users")
            .select("ref_code")
            .eq("wallet_address", walletAddress)
            .single();

          if (user?.ref_code) refCode = user.ref_code;
        } catch (err) {
          console.warn("❌ ref_code 조회 실패", err);
        }

        const { error } = await supabase.from("usdt_history").insert([
          {
            wallet_address: walletAddress,
            ref_code: refCode,
            direction: "in",
            amount: diff,
            tx_hash: "auto-detect",
            status: "completed",
          },
        ]);

        if (!error) {
          console.log("✅ 자동 입금 기록 완료:", { walletAddress, refCode, diff });
        } else {
          console.error("❌ 자동 입금 기록 실패:", error);
        }
      } else {
        localStorage.setItem("usdt_balance", formatted);
      }

      setUsdtBalance(`${formatted} USDT`);
    } catch (err) {
      console.error("❌ USDT 잔액 조회 실패:", err);
      setUsdtBalance("0.00 USDT");
    }
  };

  useEffect(() => {
    if (account && !balanceCalled.current) {
      balanceCalled.current = true;
      fetchUSDTBalance();
      fetchTodayRewards();
      syncNFTs();
      fetchUserInfo();
    }
  }, [account]);

  const fetchTodayRewards = async () => {
    if (!account?.address) return;
    const today = new Date().toISOString().split("T")[0];

    const { data: user } = await supabase
      .from("users")
      .select("ref_code")
      .eq("wallet_address", address)
      .maybeSingle();

    if (!user?.ref_code) return;

    const { data, error } = await supabase
      .from("reward_transfers")
      .select("reward_amount, referral_amount, center_amount, created_at")
      .eq("ref_code", user.ref_code)
      .gte("created_at", `${today}T00:00:00`)
      .lt("created_at", `${today}T23:59:59`);

    if (error || !data || data.length === 0) {
      setInvestReward(0);
      setReferralReward(0);
      return;
    }

    const todayLog = data[0];
    const invest = Number(todayLog.reward_amount || 0);
    const referral = Number(todayLog.referral_amount || 0);
    const center = Number(todayLog.center_amount || 0);

    setInvestReward(invest);
    setReferralReward(referral + center);
  };

  const syncNFTs = async () => {
    if (!account?.address) return;

    const lowerAddress = account.address.toLowerCase();

    const { data: user } = await supabase
      .from("users")
      .select("ref_code, ref_by, center_id")
      .eq("wallet_address", lowerAddress)
      .maybeSingle();

    if (!user || !user.ref_code) return;

    const balances = await getOnchainNFTBalances(
      lowerAddress,
      user.ref_code,
      user.ref_by || "SW10101",
      user.center_id || "SW10101"
    );

    const { error } = await supabase.from("nfts").upsert({
      ref_code: user.ref_code,
      wallet_address: lowerAddress,
      ref_by: user.ref_by || "SW10101",
      center_id: user.center_id || "SW10101",
      nft300: balances.nft300,
      nft3000: balances.nft3000,
      nft10000: balances.nft10000,
    }, {
      onConflict: "ref_code",
    });

 if (!error) {
  setNftBalances({
    nft300: balances["nft300"] || 0,
    nft3000: balances["nft3000"] || 0,
    nft10000: balances["nft10000"] || 0,
  });
}

  const fetchUserInfo = async () => {
    const { data } = await supabase
      .from("users")
      .select("name, nickname")
      .eq("wallet_address", address)
      .maybeSingle();

    if (data) {
      setName(data.name || "");
      setNickname(data.nickname || "");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    alert("주소가 복사되었습니다.");
  };

  return (
    <main className="w-full min-h-screen bg-[#f5f7fa] pt-0 pb-20">
      <TopBar icon={<Home size={20} className="text-gray-700" />} title="홈" />
      <div className="max-w-[500px] mx-auto px-4 pt-4 space-y-2">
        <section className="bg-white rounded-xl shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">오늘의 리워드</h3>
            <p className="text-2xl font-bold text-black">{(investReward + referralReward).toFixed(2)} USDT</p>
          </div>
          <div className="text-sm space-y-1">
            <p className="flex justify-between">
              <span className="text-gray-500">투자리워드</span>
              <span className="font-semibold text-gray-800">{investReward.toFixed(2)} USDT</span>
            </p>
            <p className="flex justify-between">
              <span className="text-gray-500">추천리워드</span>
              <span className="font-semibold text-gray-800">{referralReward.toFixed(2)} USDT</span>
            </p>
          </div>
          <p className="mt-2 text-xs text-gray-400">※ 매일 오전 9시 이전에 자동 입금됩니다.</p>
        </section>

        <section className="bg-white rounded-xl shadow overflow-hidden">
          <div className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 flex justify-between items-center">
            <span>나의 지갑 입금 주소</span>
            <span>
              {name ? `${name}님, 반갑습니다.` :
               nickname ? `${nickname}님, 반갑습니다.` :
               `${address.slice(0, 6)}...${address.slice(-4)}님`}
            </span>
          </div>
          <div className="p-4 text-center">
            <p className="text-sm font-mono text-gray-800 break-all mb-2">{address}</p>
            <p className="text-xs text-gray-500 mb-4">※ 해당 주소는 POLYGON 체인의 USDT 입금만 지원합니다.</p>
            <button onClick={handleCopy} className="flex items-center justify-center w-full bg-blue-100 text-blue-700 py-2 rounded-full text-sm font-semibold hover:bg-blue-200">
              <Copy className="w-4 h-4 mr-1" /> 주소 복사하기
            </button>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow">
          <div className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-t-xl">나의 코인 자산</div>
          <div className="p-4 space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <img src="/tether-icon.png" alt="USDT" className="w-6 h-6" />
                <span className="font-semibold text-gray-800">Tether</span>
              </div>
              <span className="text-gray-800 font-semibold">{usdtBalance}</span>
            </div>
            <button onClick={() => router.push("/withdraw")} className="w-full bg-blue-100 text-blue-700 py-2 rounded-full text-sm font-semibold hover:bg-blue-200">
              출금하기
            </button>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow">
          <div className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-t-xl">나의 NFT 자산</div>
          <div className="px-4 p-2 space-y-1">
            {[{
              name: "SNOWBOT 300",
              image: "/SNOW100.PNG",
              type: "nft300",
            }, {
              name: "SNOWBOT 3000",
              image: "/snowbot3000.png",
              type: "nft3000",
            }, {
              name: "SNOWBOT 10000",
              image: "/snowbot10000.png",
              type: "nft10000",
            }].map((nft) => (
              <div key={nft.type} className="flex items-center space-x-4">
                <img src={nft.image} alt={nft.name} className="w-16 h-16 rounded-xl border" />
                <div>
                  <p className="font-semibold text-gray-800">{nft.name}</p>
                  <p className="text-sm text-gray-500">
                    보유 수량: <span className="text-blue-600 font-bold">{nftBalances[nft.type]}개</span>
                  </p>
                </div>
              </div>
            ))}

          </div>
        </section>
      </div>
      <BottomNav />
    </main>
  );
}
