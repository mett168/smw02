import InviteRedirectClient from "./InviteRedirectClient";

export default function InvitePage(props: any) {
  const code = props?.params?.code;

  return <InviteRedirectClient code={code} />;
}


