// src/app/invite/[code]/page.tsx
import InviteRedirectClient from "./InviteRedirectClient";

export default function InvitePage({ params }: { params: { code: string } }) {
  return <InviteRedirectClient code={params.code} />;
}
