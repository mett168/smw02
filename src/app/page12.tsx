'use client';

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { embeddedWallet } from "thirdweb/wallets";
import { polygon } from "thirdweb/chains";
import { client } from "@/client";

export default function MainPage() {
  const account = useActiveAccount();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [called, setCalled] = useState(false);

  useEffect(() => {
    const hasLoggedOut = localStorage.getItem("logged_out") === "true";

    const registerUser = async () => {
      if (!account?.address || called) return;

      const referredBy = searchParams.get("ref");

      try {
        const res = await fetch("/api/register", {
          method: "POST",
          body: JSON.stringify({
            walletAddress: account.address,
            referredBy: referredBy || null,
          }),
        });

        const data = await res.json();
        console.log("✅ /api/register 결과:", data);
        setCalled(true);

        if (!hasLoggedOut) {
          router.replace("/home");
        } else {
          setTimeout(() => {
            localStorage.removeItem("logged_out");
            console.log("🧹 logged_out 플래그 삭제 완료");
          }, 300);
        }
      } catch (err) {
        console.error("❌ 등록 실패:", err);
      }
    };

    registerUser();
  }, [account, called, router, searchParams]);

  return (
    <main className="min-h-screen flex flex-col bg-[#f8fafc] px-4 py-6 max-w-md mx-auto text-center">
      {/* 슬로건 박스 */}
      <section className="w-full mb-6">
        <div className="bg-green-100 rounded-xl p-4">
          <p className="text-gray-600 text-sm">눈덩이처럼 불어나는 나의 자산</p>
          <h1 className="text-xl font-bold text-gray-800 mt-1">SMW01</h1>
        </div>
      </section>

      {/* 로고 + 버튼 */}
      <div className="flex flex-col items-center justify-center flex-grow gap-8 w-full">
        <div className="bg-white rounded-xl p-4 shadow-md">
          <Image src="/logo.png" alt="Logo" width={100} height={100} priority />
        </div>

        {!account && (
          <div className="bg-white rounded-xl p-4 shadow-md w-full">
            <ConnectButton
              client={client}
              activeChain={polygon}
              wallets={[embeddedWallet({ auth: { options: ["google"] } })]}
              connectButton={{
                label: "Google로 시작하기",
                style: {
                  backgroundColor: "#cce4ff",
                  color: "#003366",
                  padding: "14px 0",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "600",
                  width: "100%",
                  border: "1px solid #99cfff",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                },
              }}
              connectModal={{ title: "Google로 시작하기" }}
              onConnect={() => {
                console.log("📲 onConnect 발생 (라우팅은 useEffect에서 처리)");
              }}
            />
          </div>
        )}
      </div>

      {/* 약관 */}
      <footer className="text-xs text-gray-700 w-full mt-10">
        <div className="bg-yellow-100 rounded-lg p-4 space-y-2">
          <p>
            계속하면 <Link href="/terms" className="text-blue-600">이용약관</Link>에 동의하는 것입니다.
          </p>
          <p>
            <Link href="/privacy" className="text-blue-600">개인정보 처리방침</Link>을 확인하세요.
          </p>
        </div>
      </footer>
    </main>
  );
}
