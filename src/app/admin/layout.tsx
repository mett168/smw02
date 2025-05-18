// src/app/admin/layout.tsx
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">🔐 관리자 페이지</h1>
        <nav className="mt-2 space-x-4">
          <a href="/admin/dashboard">대시보드</a>
          <a href="/admin/users">회원목록</a>
          <a href="/admin/center">센터관리</a>
          <a href="/admin/rewards">리워드내역</a>
          <a href="/admin/snapshot">📸 스냅샷</a>
          <a href="/admin/reward-calc">🧮 리워드 계산</a>
          <a href="/admin/send-rewards">💸 리워드 지급</a>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
