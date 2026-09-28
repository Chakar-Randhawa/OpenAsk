import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { Footer } from './Footer';

interface MainLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  rightSidebar?: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  showSidebar = true,
  rightSidebar
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 antialiased overflow-x-hidden">
      <Navbar />

      <div className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex items-start gap-6 lg:gap-8">
          {showSidebar && <Sidebar />}

          <main className="flex-1 min-w-0 pb-20 md:pb-12">
            {children}
          </main>

          {rightSidebar && rightSidebar}
        </div>
      </div>

      <Footer />
      <BottomNav />
    </div>
  );
};
