// src/app/invite/[code]/InviteRedirectClient.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function InviteRedirectClient({ code }: { code: string }) {
  const router = useRouter();

  useEffect(() => {
    if (code) {
      // ✅ 추천 코드 저장
      localStorage.setItem("ref_by", code);
      console.log("✅ 추천 코드 저장됨:", code);

      // ✅ 루트로 리디렉션
      router.replace("/");
    }
  }, [code]);

  return null;
}

