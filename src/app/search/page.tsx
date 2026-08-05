"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { performSearchAction } from "@/app/actions";
import { SearchResults } from "@/components/search/SearchResults";
import { Search as SearchIcon, Loader2 } from "lucide-react";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";
  
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    } else {
      setResults(null);
    }
  }, [initialQuery]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults(null);
      return;
    }
    
    setIsSearching(true);
    try {
      const searchResults = await performSearchAction(searchQuery);
      setResults(searchResults);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-16 max-w-5xl min-h-[60vh]">
      <div className="max-w-2xl mx-auto mb-12">
        <h1 className="font-heading text-3xl md:text-4xl text-foreground mb-6 text-center">Search</h1>
        
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for dresses, kurtis, styling tips..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-border rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent text-lg transition-all"
          />
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted" />
          <button 
            type="submit" 
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-sage hover:bg-sage/90 text-white px-6 py-2 rounded-full font-medium transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {isSearching ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-sage" />
        </div>
      ) : results ? (
        <SearchResults results={results} query={initialQuery} />
      ) : (
        <div className="text-center text-muted py-20">
          Enter a search term above to find curated fashion and styling advice.
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-sage" /></div>}>
      <SearchContent />
    </Suspense>
  );
}
