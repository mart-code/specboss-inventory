"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { icons } from "@/components/icons";
import { LogoutButton } from "@/components/header";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: "dashboard" },
  { name: "Products", href: "/products", icon: "products" },
  { name: "Inventory", href: "/inventory", icon: "inventory" },
  { name: "Orders", href: "/orders", icon: "orders" },
  { name: "Delivery Companies", href: "/delivery-companies", icon: "companies" },
  { name: "States", href: "/states", icon: "states" },
  { name: "Reports", href: "/reports", icon: "reports" },
];

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();

  return (
    <div className={`hidden lg:flex lg:flex-col bg-gray-900 text-gray-100 h-screen overflow-y-auto transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        {!collapsed && <span className="text-xl font-bold">SpecBoss</span>}
        <button
          onClick={onToggle}
          className="p-1 rounded-md text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors"
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </button>
      </div>
      <nav className="flex-1 py-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-2.5 text-sm transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              } ${collapsed ? "justify-center" : ""}`}
              title={item.name}
            >
              <span className={`flex items-center justify-center ${collapsed ? "" : "mr-3"}`}>
                {icons[item.icon]}
              </span>
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>
      <div className={`p-4 border-t border-gray-800 ${collapsed ? "flex justify-center" : ""}`}>
        <LogoutButton collapsed={collapsed} />
      </div>
    </div>
  );
}
