// src/app/redirect/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useActiveAccount } from "thirdweb/react";
import { supabase } from "@/lib/supabaseClient";

export default function RedirectPage() {
  const account = useActiveAccount();
  const router = useRouter();

  useEffect(() => {
    const checkUserInfo = async () => {
      if (!account?.address) return;

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("wallet", account.address.toLowerCase())
        .single();

      if (data && data.ref_code) {
        router.replace("/home");
      } else {
        router.replace("/register-info");
      }
    };

    checkUserInfo();
  }, [account]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <p className="text-sm text-gray-500">회원 정보를 확인 중입니다...</p>
    </main>
  );
}
