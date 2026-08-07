"use client";

import { useState, useEffect } from "react";
import { X, SlidersHorizontal, Check } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface FilterOption {
  label: string;
  value: string;
}

const SIZES: FilterOption[] = [
  { label: "XS", value: "XS" },
  { label: "S", value: "S" },
  { label: "M", value: "M" },
  { label: "L", value: "L" },
  { label: "XL", value: "XL" },
  { label: "2XL", value: "2XL" },
  { label: "3XL", value: "3XL" },
  { label: "4XL", value: "4XL" },
];

const OCCASIONS: FilterOption[] = [
  { label: "Casual", value: "Casual" },
  { label: "Work", value: "Work" },
  { label: "Party", value: "Party" },
  { label: "Vacation", value: "Vacation" },
  { label: "Wedding Guest", value: "Wedding Guest" },
];

const SORTS: FilterOption[] = [
  { label: "Newest Arrivals", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
];

export function ProductFilterSidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Local state for filters so it doesn't apply immediately
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [sort, setSort] = useState<string>("newest");

  // Sync state with URL when opened
  useEffect(() => {
    if (isOpen) {
      setSelectedSizes(searchParams.get("sizes")?.split(",") || []);
      setSelectedOccasions(searchParams.get("occasions")?.split(",") || []);
      setSort(searchParams.get("sort") || "newest");
    }
  }, [isOpen, searchParams]);

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleOccasion = (occasion: string) => {
    setSelectedOccasions((prev) =>
      prev.includes(occasion) ? prev.filter((o) => o !== occasion) : [...prev, occasion]
    );
  };

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (selectedSizes.length > 0) {
      params.set("sizes", selectedSizes.join(","));
    } else {
      params.delete("sizes");
    }

    if (selectedOccasions.length > 0) {
      params.set("occasions", selectedOccasions.join(","));
    } else {
      params.delete("occasions");
    }

    if (sort && sort !== "newest") {
      params.set("sort", sort);
    } else {
      params.delete("sort");
    }

    onClose();
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClear = () => {
    setSelectedSizes([]);
    setSelectedOccasions([]);
    setSort("newest");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 transition-opacity backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div className="relative w-full max-w-sm flex flex-col bg-background shadow-2xl h-full animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5" />
            <h2 className="font-heading text-xl">Filter & Sort</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-muted hover:text-foreground rounded-full hover:bg-accent/50 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
          {/* Sort */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Sort By</h3>
            <div className="space-y-3">
              {SORTS.map((option) => (
                <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${sort === option.value ? 'border-sage bg-sage' : 'border-input group-hover:border-sage'}`}>
                    {sort === option.value && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <span className={`text-sm ${sort === option.value ? 'font-medium' : 'text-muted-foreground'}`}>{option.label}</span>
                  <input
                    type="radio"
                    name="sort"
                    value={option.value}
                    checked={sort === option.value}
                    onChange={(e) => setSort(e.target.value)}
                    className="sr-only"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="h-px bg-border/50 w-full" />

          {/* Sizes */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider">Sizes</h3>
              {selectedSizes.length > 0 && (
                <span className="text-xs bg-sage/10 text-sage px-2 py-0.5 rounded-full font-medium">
                  {selectedSizes.length} selected
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((size) => (
                <button
                  key={size.value}
                  onClick={() => toggleSize(size.value)}
                  className={`px-4 py-2 text-sm border rounded-[var(--radius-button)] transition-colors ${
                    selectedSizes.includes(size.value)
                      ? "bg-sage border-sage text-white font-medium"
                      : "bg-transparent border-input hover:border-sage text-foreground"
                  }`}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-border/50 w-full" />

          {/* Occasions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider">Occasion</h3>
              {selectedOccasions.length > 0 && (
                <span className="text-xs bg-sage/10 text-sage px-2 py-0.5 rounded-full font-medium">
                  {selectedOccasions.length} selected
                </span>
              )}
            </div>
            <div className="space-y-3">
              {OCCASIONS.map((option) => {
                const isSelected = selectedOccasions.includes(option.value);
                return (
                  <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'border-sage bg-sage' : 'border-input group-hover:border-sage'}`}>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                    </div>
                    <span className={`text-sm ${isSelected ? 'font-medium' : 'text-muted-foreground'}`}>{option.label}</span>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleOccasion(option.value)}
                      className="sr-only"
                    />
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-border bg-background flex gap-4">
          <button
            onClick={handleClear}
            className="px-6 py-3 border border-input rounded-[var(--radius-button)] text-foreground hover:bg-accent/50 font-medium transition-colors"
          >
            Clear All
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-6 py-3 bg-foreground text-white rounded-[var(--radius-button)] font-medium hover:bg-foreground/90 transition-colors"
          >
            Show Results
          </button>
        </div>
      </div>
    </div>
  );
}
