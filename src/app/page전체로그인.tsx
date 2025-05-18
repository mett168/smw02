'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { smartWallet, inAppWallet } from "thirdweb/wallets";
import { polygon } from "thirdweb/chains";
import { client } from "@/client";

// ✅ 스마트 월렛 로그인 설정
const loginWallet = smartWallet({
  client,
  chain: polygon,
  factoryAddress: "0xc2702a23f2e62445809525db6a7294773d46e938a",
  entryPointAddress: "0xA218F22E3d931FfFa3B5A71DfFd2e6D4Ab1F3b4A",
  bundlerUrl: "https://bundler.thirdweb.com",
  paymasterUrl: "https://paymaster.thirdweb.com",
  gasless: true,
  personalWallets: [inAppWallet({ auth: { options: ["google"] } })],
});

export default function MainPage() {
  const account = useActiveAccount();
  const router = useRouter();

  useEffect(() => {
    const hasLoggedOut = localStorage.getItem("logged_out") === "true";

    if (account && !hasLoggedOut) {
      router.replace("/home");
    }

    if (hasLoggedOut) {
      setTimeout(() => {
        localStorage.removeItem("logged_out");
        console.log("🧹 logged_out 플래그 삭제 완료");
      }, 300);
    }
  }, [account, router]);

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
          <Image src="/logo.png" alt="Logo" width={100} height={100} />
        </div>

        {!account && (
          <div className="bg-white rounded-xl p-4 shadow-md w-full">
            <ConnectButton
              client={client}
              wallet={loginWallet}
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
                console.log("✅ 로그인 성공 → 홈으로 이동");
                router.replace("/home");
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