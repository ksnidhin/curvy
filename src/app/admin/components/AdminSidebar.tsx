'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LogoutButton } from './LogoutButton';

export function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Header & Hamburger */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <h2 className="text-lg font-heading font-semibold text-foreground">Curvy Girls Admin</h2>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 -mr-2 text-gray-500 hover:text-gray-900"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/20 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 p-6 flex flex-col transition-transform duration-200 ease-in-out
        md:relative md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="mb-8 hidden md:block">
          <h2 className="text-xl font-heading font-semibold text-foreground">Curvy Girls</h2>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Admin Panel</p>
        </div>

        <nav className="flex-1 space-y-2">
          <Link 
            href="/admin" 
            onClick={() => setIsOpen(false)}
            className="flex items-center space-x-3 px-3 py-2.5 rounded-lg bg-gray-100 text-gray-900 font-medium transition-colors"
          >
            Dashboard
          </Link>
          <Link 
            href="/admin/products" 
            onClick={() => setIsOpen(false)}
            className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium transition-colors"
          >
            Products
          </Link>
          <Link 
            href="/admin/categories" 
            onClick={() => setIsOpen(false)}
            className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium transition-colors"
          >
            Categories
          </Link>
          <Link 
            href="/admin/blog" 
            onClick={() => setIsOpen(false)}
            className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium transition-colors"
          >
            Blog
          </Link>
          <Link 
            href="/admin/settings/hero" 
            onClick={() => setIsOpen(false)}
            className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium transition-colors"
          >
            Hero Slider
          </Link>
        </nav>

        <div className="pt-6 border-t border-gray-200 mt-auto space-y-4">
          <LogoutButton />
          <Link 
            href="/" 
            className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            ← Back to Storefront
          </Link>
        </div>
      </aside>
    </>
  );
}
