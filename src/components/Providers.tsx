'use client';

import { ReactNode } from 'react';
import { ThirdwebProvider } from 'thirdweb/react';
import { client } from '@/client';
import { polygon } from 'thirdweb/chains';
import { smartWallet, embeddedWallet } from 'thirdweb/wallets';

// ✅ Smart Wallet 구성
const walletConfig = smartWallet(embeddedWallet(), {
  chain: polygon,
  factoryAddress: '0x2702a23f2e62445809525db6a7294773d46e938a', // 👉 실제 스마트월렛 팩토리 주소로 교체
  gasless: true, // Paymaster 방식
});

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThirdwebProvider
      client={client}
      activeChain={polygon}
      wallets={[walletConfig]} // ✅ 스마트월렛 추가
    >
      {children}
    </ThirdwebProvider>
  );
}
