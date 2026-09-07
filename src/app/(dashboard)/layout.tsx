"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Header, MobileHeader, BottomNav } from "@/components/header";
import { ProtectedRoute } from "@/components/protected-route";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden">
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
          <div className="lg:hidden">
            <MobileHeader />
          </div>
          <div className="hidden lg:block">
            <Header sidebarCollapsed={sidebarCollapsed} onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
          </div>
          <main className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-6 pb-16 lg:pb-6">
            {children}
          </main>
          <BottomNav />
        </div>
      </div>
    </ProtectedRoute>
  );
}
