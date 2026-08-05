"use client";

import { Share } from "lucide-react";

interface ShareButtonProps {
  className?: string;
  title?: string;
  url?: string;
}

export function ShareButton({ className = "", title, url }: ShareButtonProps) {
  const handleShare = async () => {
    if (typeof window === 'undefined') return;
    
    const shareData = {
      title: title || "Curvy Girls",
      url: url || window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        // TODO: Add toast notification for clipboard copy
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  return (
    <button 
      className={className}
      aria-label="Share this page"
      onClick={handleShare}
    >
      <Share className="h-5 w-5" />
    </button>
  );
}
