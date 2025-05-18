"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useActiveAccount } from "thirdweb/react";

export default function InvitedUsersList() {
  const account = useActiveAccount();
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchInvited = async () => {
      if (!account?.address) return;

      const { data: me } = await supabase
        .from("users")
        .select("ref_code")
        .eq("wallet_address", account.address.toLowerCase())
        .maybeSingle();

      if (!me?.ref_code) return;

      const { data, error } = await supabase
        .from("users")
        .select("name, created_at")
        .eq("ref_by", me.ref_code)
        .order("created_at", { ascending: false });

      if (data) setUsers(data);
    };
    fetchInvited();
  }, [account]);

  return (
    <ul className="text-sm text-gray-800 divide-y">
      {users.map((u, i) => (
        <li key={i} className="flex justify-between py-2">
          <span>{new Date(u.created_at).toLocaleDateString()}</span>
          <span className="font-medium">{u.name}</span>
        </li>
      ))}
      {users.length === 0 && <li className="py-4 text-center text-gray-400">초대한 친구가 없습니다.</li>}
    </ul>
  );
}