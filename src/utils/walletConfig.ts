// utils/walletConfig.ts
import { smartWallet, embeddedWallet } from "thirdweb/wallets";
import { polygon } from "thirdweb/chains";

export const smartWalletConfig = smartWallet(embeddedWallet(), {
  chain: polygon,
  factoryAddress: "0xYourFactoryAddress", // 실제 factory 주소로 교체
  gasless: true,
});
