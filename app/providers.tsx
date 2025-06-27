'use client';

import WalletProvider from '@/context';
import Navbar from './components/Navbar';

export default function ClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WalletProvider>
      <Navbar />
      {children}
    </WalletProvider>
  );
} 