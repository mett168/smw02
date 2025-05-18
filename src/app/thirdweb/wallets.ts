// thirdweb/wallet.ts
import { smartWallet, embeddedWallet } from "thirdweb/wallets";

export const walletConfig = smartWallet({
  factoryAddress: "0x85e23b94e7F5E9cC1fF78BCe78cfb15B81f0DF00", // ✴️ 스마트월렛 팩토리 주소
  gasless: true,
  personalWallets: [embeddedWallet()],
});
