import React from 'react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="main-shell min-h-screen">
      <div className="flex w-full">
        <aside className="hidden w-64 shrink-0 md:block">
          <Sidebar />
        </aside>

        <div className="flex flex-1 flex-col">
          <TopNav />
          <div className="px-4 py-6 md:px-8 md:py-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
