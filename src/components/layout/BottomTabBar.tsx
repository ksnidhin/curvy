"use client";

import Link from "next/link";
import { Home, LayoutGrid, BookOpen, Search } from "lucide-react";
import { ROUTES } from "@/lib/config/routes";
import { usePathname } from "next/navigation";

export function BottomTabBar() {
  const pathname = usePathname();

  const tabs = [
    { label: "Home", href: ROUTES.home, icon: Home },
    { label: "Categories", href: ROUTES.categories, icon: LayoutGrid },
    { label: "Blog", href: ROUTES.blog, icon: BookOpen },
    { label: "Search", href: ROUTES.search, icon: Search },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border px-6 py-3 flex justify-between items-center safe-area-bottom">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        const Icon = tab.icon;
        
        return (
          <Link 
            key={tab.label}
            href={tab.href}
            className={`flex flex-col items-center gap-1 min-w-[64px] ${isActive ? 'text-foreground' : 'text-muted'}`}
          >
            <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-medium leading-none">{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
