import Header from '@/components/layout/header';
import Sidebar from '@/components/layout/sidebar';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Next Shadcn Dashboard Starter',
  description: 'Basic dashboard with Next.js and Shadcn'
};

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden pt-16">    
          <Suspense fallback={<div>Carregando...</div>}>
          {children}
        </Suspense></main>
      </div>
    </>
  );
}
