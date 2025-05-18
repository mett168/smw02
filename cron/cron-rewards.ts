// cron/cron-rewards.ts

import cron from "node-cron";
import { calculateAndRecordRewards } from "@/lib/calculateAndRecordRewards";

// 매일 UTC 07:50 = 한국시간(KST) 16:50에 실행
cron.schedule("59 7 * * *", async () => {
  console.log("🕓 [CRON] 리워드 계산 실행 (KST 16:59)");
  await calculateAndRecordRewards();
});
