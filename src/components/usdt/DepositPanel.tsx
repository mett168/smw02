// src/components/usdt/DepositPanel.tsx

'use client';

import { useState } from 'react';

export default function DepositPanel({ account }: { account: any }) {
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    if (!account?.address) return;
    try {
      await navigator.clipboard.writeText(account.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("주소 복사에 실패했습니다.");
    }
  };

  return (
    <section className="bg-white shadow rounded-xl p-4 text-center">
      <p className="text-gray-500 text-sm mb-2">입금 지갑 주소</p>
      <p className="font-mono text-sm break-all mb-3">
        {account?.address ?? "지갑 없음"}
      </p>
      <button
        onClick={copyAddress}
        className="bg-blue-600 text-white px-4 py-1 rounded text-sm"
      >
        {copied ? "복사됨!" : "주소 복사"}
      </button>
      <p className="text-xs text-gray-500 mt-2">
        * 해당 주소는 <strong>Polygon 체인</strong>의 USDT 입금만 지원합니다.
      </p>
    </section>
  );
}
