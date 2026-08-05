"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { NavLink } from "@/lib/types/settings";
import { ROUTES } from "@/lib/config/routes";
import { CONSTANTS } from "@/lib/config/constants";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  links: NavLink[];
}

export function MobileNav({ isOpen, onClose, links }: MobileNavProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 transition-opacity" 
        onClick={onClose}
      />
      
      {/* Menu panel */}
      <div className="relative flex w-full max-w-xs flex-col overflow-y-auto bg-background pb-12 shadow-xl">
        <div className="flex px-4 pb-2 pt-5 justify-between items-center border-b border-border">
          <Link href={ROUTES.home} className="flex flex-col leading-none" onClick={onClose}>
            <span className="font-heading text-xl">{CONSTANTS.SITE_NAME}</span>
          </Link>
          <button
            type="button"
            className="-m-2 inline-flex items-center justify-center rounded-md p-2 text-muted hover:text-foreground"
            onClick={onClose}
          >
            <span className="sr-only">Close menu</span>
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-6 px-4 py-6">
          {links.map((link) => (
            <div key={link.label} className="flow-root">
              <Link
                href={link.href}
                className="-m-2 block p-2 text-lg font-medium text-foreground"
                onClick={onClose}
              >
                {link.label}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
