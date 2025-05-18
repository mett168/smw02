// 📄 /src/app/invite/[code]/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function InviteRedirectPage({ params }: { params: { code: string } }) {
  const router = useRouter();

  useEffect(() => {
    if (params?.code) {
      // ✅ 추천인 코드 localStorage에 저장
      localStorage.setItem("ref_by", params.code);
      console.log("✅ 추천 코드 저장됨:", params.code);

      // ✅ 로그인 페이지로 리디렉션
      router.replace("/");
    }
  }, [params]);

  return null;
}
