import { supabase } from "@/lib/supabaseClient";

// 추천 코드 생성 함수
export async function generateReferralCode(): Promise<string> {
  // 1. 최신 referral_code 가져오기 (users 테이블에서)
  const { data, error } = await supabase
    .from("users")
    .select("referral_code")
    .order("created_at", { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) {
    console.error("❌ 추천코드 조회 실패:", error);
    return "SW01000";
  }

  // 2. 마지막 추천 코드에서 숫자 추출 후 +1
  const lastCode = data[0].referral_code || "SW01000";
  const number = parseInt(lastCode.replace("SW", ""), 10);
  const nextNumber = number + 1;

  // 3. 새로운 추천코드 생성 (예: SW01001 → SW01002)
  const newCode = `SW${nextNumber.toString().padStart(5, "0")}`;

  return newCode;
}
