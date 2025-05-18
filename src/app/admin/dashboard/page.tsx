// src/app/admin/dashboard/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();

  useEffect(() => {
    const isAdmin = localStorage.getItem("admin_logged_in") === "true";
    if (!isAdmin) {
      alert("🔒 관리자 로그인 후 이용해주세요.");
      router.push("/admin/login");
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6">🛠️ 관리자 대시보드</h1>

      <ul className="space-y-4">
        <li>
          <a
            href="/admin/users"
            className="block p-4 bg-white shadow rounded hover:bg-gray-100"
          >
            👥 회원 목록 보기
          </a>
        </li>
        <li>
          <a
            href="/admin/center"
            className="block p-4 bg-white shadow rounded hover:bg-gray-100"
          >
            🏢 센터장 설정
          </a>
        </li>
        <li>
          <a
            href="/admin/rewards"
            className="block p-4 bg-white shadow rounded hover:bg-gray-100"
          >
            💰 추천 리워드 지급 내역
          </a>
        </li>
      </ul>
    </main>
  );
}
