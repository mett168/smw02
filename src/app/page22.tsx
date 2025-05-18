'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { embeddedWallet } from "thirdweb/wallets";
import { polygon } from "thirdweb/chains";
import { client } from "@/client";
import { toast } from "react-hot-toast";

export default function MainPage() {
  const account = useActiveAccount();
  const router = useRouter();
  const [called, setCalled] = useState(false);

  useEffect(() => {
    if (!account || called) return;
    setCalled(true);

    const referredBy =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("ref")
        : null;

    fetch("/api/register", {
      method: "POST",
      body: JSON.stringify({
        walletAddress: account.address,
        referredBy: referredBy || null,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        router.push("/home").then(() => {
          if (localStorage.getItem("logged_out") === "true") {
            localStorage.removeItem("logged_out");
          }
          window.location.reload();
        });
      })
      .catch((err) => {
        console.error("❌ register 요청 실패:", err);
        toast.error("지갑 등록 실패 ❌ 다시 시도해주세요.");
      });
  }, [account, called, router]);

  return (
    <>
      <Head>
        <title>SMW01 스마트 월렛</title>
        <meta name="description" content="눈덩이처럼 불어나는 나의 자산, SMW01 스마트 월렛에 오신 걸 환영합니다." />
        <meta property="og:title" content="SMW01 스마트 월렛" />
        <meta property="og:description" content="구글 로그인으로 시작하고, 자동 지갑 생성과 NFT 리워드를 받으세요." />
        <meta property="og:image" content="/logo.png" />
      </Head>

      <main className="min-h-screen flex flex-col justify-between bg-[#f8fafc] px-4 py-6 max-w-md mx-auto text-center">
        <div>
          {/* 슬로건 */}
          <section className="w-full mb-6">
            <div className="p-4">
              <p className="text-[16px] font-bold tracking-wide text-[#4d4e4f] text-left font-sans">
                눈덩이처럼 불어나는 나의 자산
              </p>
              <h1 className="text-[16px] font-bold tracking-wide text-[#4d4e4f] text-left font-sans">
                SNOWWALLET
              </h1>
            </div>
          </section>

          {/* 로고 */}
          <div className="flex justify-center mt-20 mb-10">
            <div className="rounded-xl p-6">
              <Image
                src="/logo.png"
                alt="Logo"
                width={100}
                height={100}
                priority
              />
            </div>
          </div>

          {/* 구글 로그인 버튼 */}
          {!account && (
            <div className="w-full mt-20 mb-10">
              <div className="rounded-xl p-6 relative h-[64px] flex items-center">
                <ConnectButton
                  client={client}
                  activeChain={polygon}
                  wallets={[
                    embeddedWallet({
                      auth: { options: ["google"] },
                    }),
                  ]}
                  connectButton={{
                    label: (
                      <div className="relative w-full flex items-center justify-center">
                        <Image
                          src="/google-icon.png"
                          alt="Google"
                          width={18}
                          height={18}
                          className="absolute left-4"
                        />
                        <span className="mx-auto">구글로 시작하기</span>
                      </div>
                    ),
                    style: {
                      backgroundColor: "transparent",
                      color: "#4d4e4f",
                      padding: "14px 0",
                      borderRadius: "12px",
                      fontSize: "15px",
                      fontWeight: "500",
                      width: "100%",
                      border: "1px solid #ccc",
                      boxShadow: "none",
                    },
                  }}
                  connectModal={{ title: "Google로 시작하기" }}
                />
              </div>
            </div>
          )}
        </div>

        {/* 약관 (하단 정렬) */}
        <footer className="text-xs text-[#4d4e4f] w-full mt-10">
          <div className="rounded-lg p-2 space-y-1 text-center leading-relaxed">
            <p>
              계속하면 이용약관에 동의하는 것입니다. {" "}
              <Link href="/terms" className="text-[#1369b9] font-medium">[이용약관]</Link>
            </p>
            <p>
              개인정보 처리방침을 확인하세요. {" "}
              <Link href="/privacy" className="text-[#1369b9] font-medium">[개인정보 처리방침]</Link>
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
