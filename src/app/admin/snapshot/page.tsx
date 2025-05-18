// src/app/admin/snapshot/page.tsx
"use client";

import { calculateAndRecordRewards } from "@/lib/calculateAndRecordRewards";

export default function SnapshotPage() {
  const handleSnapshot = async () => {
    try {
      await calculateAndRecordRewards();
      alert("✅ SNOWBOT300 스냅샷 완료!");
    } catch (err) {
      console.error("❌ 스냅샷 실행 중 오류:", err);
      alert("에러 발생. 콘솔을 확인해주세요.");
    }
  };

  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">📸 SNOWBOT300 스냅샷</h1>
      <button
        onClick={handleSnapshot}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        스냅샷 실행하기
      </button>
    </main>
  );
}
