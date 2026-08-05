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
          if (!value) return null;
          // Capitalize first letter of key
          const formattedKey = key.charAt(0).toUpperCase() + key.slice(1);
          
          return (
            <li key={key} className="text-sm flex gap-2">
              <span className="font-medium text-foreground min-w-[80px]">• {formattedKey}:</span>
              <span className="text-muted">{value}</span>
            </li>
          );
        })}
      </ul>
      
      <button className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-sage transition-colors mt-6">
        See more <ChevronDown className="h-4 w-4" />
      </button>
    </div>
  );
}
