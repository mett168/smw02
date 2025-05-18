import { createThirdwebClient } from "thirdweb";
import { polygon } from "thirdweb/chains";
import { smartWallet, inAppWallet } from "thirdweb/wallets";

// 환경 변수 체크
const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;
if (!clientId) {
  throw new Error("❌ NEXT_PUBLIC_THIRDWEB_CLIENT_ID가 설정되지 않았습니다.");
}

// Smart Wallet 구성 (Google 로그인만 허용)
const smartWalletConfig = smartWallet({
  factoryAddress: "0xc2702a23f2e62445809525db6a7294773d46e938a",
  entryPointAddress: "0xA218F22E3d931FfFa3B5A71DfFd2e6D4Ab1F3b4A",
  bundlerUrl: "https://bundler.thirdweb.com",
  paymasterUrl: "https://paymaster.thirdweb.com",
  gasless: true,
  personalWallets: [
    inAppWallet({
      auth: {
        options: ["google"], // ✅ Google만 허용
      },
    }),
  ],
});

export const client = createThirdwebClient({
  clientId,
  chain: polygon,
  wallets: [smartWalletConfig],
});
