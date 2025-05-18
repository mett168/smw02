// 📄 src/app/invite/[code]/page.tsx

import InviteRedirectClient from "./InviteRedirectClient";

interface InvitePageProps {
  params: {
    code: string;
  };
}

// ✅ 타입을 확정하고 `async` 제거 (Server Component에서 client 컴포넌트로 넘김)
export default function InvitePage({ params }: InvitePageProps) {
  return <InviteRedirectClient code={params.code} />;
}


