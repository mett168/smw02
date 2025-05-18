// src/app/admin/reward-calc/page.tsx
"use client";

import { useState } from "react";
import { calculateAndRecordRewards } from "@/lib/calculateAndRecordRewards";

export default function RewardCalcPage() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleCalc = async () => {
    setLoading(true);
    setDone(false);
    try {
      await calculateAndRecordRewards();
      setDone(true);
    } catch (err) {
      console.error("❌ 리워드 계산 실패:", err);
      alert("에러 발생: 콘솔을 확인하세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-4">🧮 리워드 계산 실행</h1>

      <button
        onClick={handleCalc}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "계산 중..." : "리워드 계산 실행"}
      </button>

      {done && (
        <p className="text-green-700 font-semibold mt-4">✅ 리워드 기록 완료!</p>
      )}
    </main>
  );
}
