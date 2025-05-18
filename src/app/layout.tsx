import './globals.css';
import { Inter } from 'next/font/google';
import Providers from '@/components/Providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'SMW01',
  description: '스마트 월렛 프로젝트',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={`${inter.className} bg-gray-100`}>
        <div className="w-full max-w-[500px] mx-auto bg-white min-h-screen shadow-md">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
