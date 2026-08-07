"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { ProductFilterSidebar } from "./ProductFilterSidebar";
import { useSearchParams } from "next/navigation";

export function FilterToggle() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const searchParams = useSearchParams();

  // Calculate active filter count
  const sizesCount = searchParams.get("sizes")?.split(",").length || 0;
  const occasionsCount = searchParams.get("occasions")?.split(",").length || 0;
  const hasSort = searchParams.has("sort") && searchParams.get("sort") !== "newest" ? 1 : 0;
  
  const activeCount = sizesCount + occasionsCount + hasSort;

  return (
    <>
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-background border border-border hover:border-sage rounded-[var(--radius-button)] text-sm font-medium transition-colors"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filter & Sort
        {activeCount > 0 && (
          <span className="ml-1 bg-sage text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
            {activeCount}
          </span>
        )}
      </button>

      <ProductFilterSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
    </>
  );
}
