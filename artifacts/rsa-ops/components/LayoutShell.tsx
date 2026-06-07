import React from 'react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#060810]">
      {/* Sidebar — fixed height, scrolls internally */}
      <aside className="hidden w-60 shrink-0 md:flex flex-col h-full">
        <Sidebar />
      </aside>

      {/* Main column */}
      <div className="flex flex-1 flex-col min-w-0 h-full overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto">
          <div className="px-5 py-6 md:px-8 md:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
