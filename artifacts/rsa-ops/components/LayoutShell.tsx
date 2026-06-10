import React from 'react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-background">
      {/* Sidebar — fixed height, scrolls internally */}
      <aside className="hidden w-64 shrink-0 lg:flex flex-col h-full z-20">
        <Sidebar />
      </aside>

      {/* Main column */}
      <div className="flex flex-1 flex-col min-w-0 h-full overflow-hidden relative z-10">
        <TopNav />
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
