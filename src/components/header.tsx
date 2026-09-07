"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { icons } from "@/components/icons";

interface HeaderProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export function Header({ sidebarCollapsed, onToggleSidebar }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <div className="hidden lg:flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200">
      <button
        onClick={onToggleSidebar}
        className="p-1 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {sidebarCollapsed ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </button>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600 hidden sm:block">
          {user?.email || "Admin"}
        </span>
        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
          <span className="text-xs font-medium text-gray-700">
            {user?.email?.[0]?.toUpperCase() || "A"}
          </span>
        </div>
        <button
          onClick={logout}
          className="p-1 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          title="Logout"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25a3 3 0 00-3-3h-1.5a3 3 0 00-3 3v2.25M15.75 9L12 12.75m3.75-3.75L12 12.75m0 0l3.75-3.75M12 12.75v9" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function LogoutButton({ collapsed }: { collapsed?: boolean }) {
  const { logout } = useAuth();

  return (
    <button
      onClick={logout}
      className={`flex items-center text-gray-300 hover:bg-gray-800 hover:text-white transition-colors ${
        collapsed ? "p-2 rounded-md" : "px-4 py-2.5 text-sm"
      }`}
      title="Logout"
    >
      <span className="flex items-center justify-center mr-3">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25a3 3 0 00-3-3h-1.5a3 3 0 00-3 3v2.25M15.75 9L12 12.75m3.75-3.75L12 12.75m0 0l3.75-3.75M12 12.75v9" />
        </svg>
      </span>
      {!collapsed && <span>Logout</span>}
    </button>
  );
}

export function MobileHeader() {
  const { user, logout } = useAuth();

  return (
    <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
      <h1 className="text-lg font-bold text-gray-900">SpecBoss</h1>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-600 hidden sm:block">
          {user?.email || "Admin"}
        </span>
        <button
          onClick={logout}
          className="p-1 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          title="Logout"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25a3 3 0 00-3-3h-1.5a3 3 0 00-3 3v2.25M15.75 9L12 12.75m3.75-3.75L12 12.75m0 0l3.75-3.75M12 12.75v9" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: "dashboard" },
    { name: "Products", href: "/products", icon: "products" },
    { name: "Inventory", href: "/inventory", icon: "inventory" },
    { name: "Orders", href: "/orders", icon: "orders" },
    { name: "Companies", href: "/delivery-companies", icon: "companies" },
    { name: "States", href: "/states", icon: "states" },
    { name: "Reports", href: "/reports", icon: "reports" },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900 text-gray-100 border-t border-gray-800 z-50">
      <nav className="flex items-center justify-around py-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-md transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
              }`}
              title={item.name}
            >
              <span className="flex items-center justify-center">
                {icons[item.icon]}
              </span>
              <span className="text-[10px] mt-0.5">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
