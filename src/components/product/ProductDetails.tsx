import { ProductAttribute } from "@/lib/types/product-advanced";
import { ChevronDown } from "lucide-react";

interface ProductDetailsProps {
  attributes?: ProductAttribute;
  details?: any; // for backward compatibility
}

export function ProductDetails({ attributes, details }: ProductDetailsProps) {
  const displayData = attributes && Object.keys(attributes).length > 0 ? attributes : details;
  
  if (!displayData || Object.keys(displayData).length === 0) return null;

  return (
    <div className="mt-8 pt-8 border-t border-border">
      <h3 className="font-heading text-xl text-foreground mb-4">Details</h3>
      <ul className="space-y-3">
        {Object.entries(displayData).map(([key, value]) => {
          if (!value || (Array.isArray(value) && value.length === 0)) return null;
          
          // Format key: camelCase to Title Case (e.g., availableSizes -> Available Sizes)
          const formattedKey = key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase());
          
          const displayValue = Array.isArray(value) ? value.join(', ') : value;
          
          return (
            <li key={key} className="text-sm flex gap-2">
              <span className="font-medium text-foreground min-w-[120px]">• {formattedKey}:</span>
              <span className="text-muted flex-1">{displayValue as React.ReactNode}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
