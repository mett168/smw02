import InviteRedirectClient from "./InviteRedirectClient";

// ✅ 타입을 명확하게 선언
type PageProps = {
  params: {
    code: string;
  };
};

export default function InvitePage({ params }: PageProps) {
  return <InviteRedirectClient code={params.code} />;
}

