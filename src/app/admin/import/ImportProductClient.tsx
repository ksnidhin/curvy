'use client';

import React, { useState, useEffect } from 'react';
import { MinimalProductForm } from '@/components/admin/MinimalProductForm';
import { Category } from '@/lib/types/category';

export function ImportProductClient({ categories }: { categories: Category[] }) {
  const [fetchUrl, setFetchUrl] = useState('');
  const [customCookies, setCustomCookies] = useState('');
  const [showCookies, setShowCookies] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [initialData, setInitialData] = useState<any>(null);
  
  // We use this to force the form to remount and re-read defaultValues when data is fetched
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('curvy_supplier_cookies');
      if (saved) setCustomCookies(saved);
    } catch (e) {
      // LocalStorage access might fail in private browsing
    }
  }, []);

  const handleCookieChange = (val: string) => {
    setCustomCookies(val);
    try {
      localStorage.setItem('curvy_supplier_cookies', val);
    } catch (e) {}
  };

  const handleClearCookies = () => {
    setCustomCookies('');
    try {
      localStorage.removeItem('curvy_supplier_cookies');
    } catch (e) {}
  };

  const handleFetch = async () => {
    if (!fetchUrl) return;
    setIsFetching(true);
    setFetchError('');
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: fetchUrl,
          cookies: customCookies.trim() || undefined
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch');
      
      let derivedStore = '';
      try {
        const hostname = new URL(fetchUrl).hostname.replace('www.', '');
        derivedStore = hostname.split('.')[0];
        if (derivedStore === 'amzn') derivedStore = 'amazon';
        derivedStore = derivedStore.charAt(0).toUpperCase() + derivedStore.slice(1);
      } catch(e) {}
      
      const scrapedProduct = {
        title: data.title || '',
        description: data.description || '',
        price: data.price || '',
        affiliateUrl: fetchUrl,
        storeName: derivedStore || '',
        brand: data.brand || '',
        categorySlug: categories.find(c => c.name.toLowerCase() === (data.category || '').toLowerCase())?.slug || '',
        attributes: {
          colors: data.colors ? data.colors.split(',').map((s: string) => s.trim()) : [],
          availableSizes: data.availableSizes ? data.availableSizes.split(',').map((s: string) => s.trim()) : [],
          clothType: data.clothType || '',
          occasion: data.occasion || ''
        },
        images: (data.images || []).map((url: string) => ({ url })) // MinimalProductForm handles strings/objects
      };
      
      setInitialData(scrapedProduct);
      setFormKey(prev => prev + 1);
    } catch (err: any) {
      setFetchError(err.message);
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-medium text-gray-900 mb-4">Import from Supplier Link</h2>
        <div className="bg-sage/5 p-4 rounded-md border border-sage/20 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Supplier URL</label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="Paste Amazon, Flipkart, Myntra, Ajio, Meesho link here..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-sage focus:border-sage"
                value={fetchUrl}
                onChange={(e) => setFetchUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isFetching && fetchUrl && handleFetch()}
                disabled={isFetching}
              />
              <button
                type="button"
                onClick={handleFetch}
                disabled={isFetching || !fetchUrl}
                className="px-4 py-2 bg-sage text-white rounded-md hover:bg-sage/90 disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                {isFetching ? 'Fetching...' : 'Fetch Data'}
              </button>
            </div>
          </div>

          {/* Session Cookies Section */}
          <div className="pt-2 border-t border-sage/20">
            <button
              type="button"
              onClick={() => setShowCookies(!showCookies)}
              className="text-xs font-medium text-sage hover:underline flex items-center gap-1.5 focus:outline-none"
            >
              <span>{showCookies ? '▼ Hide Session Cookies' : '▶ Personal PC Cookies (Bypass Bot Check)'}</span>
              {customCookies.trim() && (
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-green-100 text-green-800 font-semibold">
                  Cookies Active
                </span>
              )}
            </button>

            {showCookies && (
              <div className="mt-3 p-3 bg-white rounded-md border border-gray-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Paste Browser Cookie Header or Cookie-Editor JSON:</span>
                  {customCookies.trim() && (
                    <button
                      type="button"
                      onClick={handleClearCookies}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <textarea
                  rows={3}
                  placeholder="Paste cookies here (e.g. session-id=259-...; ubid-acbin=... or [{ name: '...', value: '...' }])"
                  value={customCookies}
                  onChange={(e) => handleCookieChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs focus:ring-sage focus:border-sage"
                />
                <p className="text-gray-500 text-[11px] leading-relaxed">
                  💡 <strong>How to get cookies from your PC:</strong> On Amazon or Myntra in Chrome, press <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded">F12</kbd> → <strong>Network</strong> tab → click any request to the site → right-click <strong>Cookie</strong> in Request Headers → <strong>Copy value</strong>. Cookies are automatically saved in your browser for future imports.
                </p>
              </div>
            )}
          </div>

          {fetchError && <p className="text-red-500 text-xs mt-2">{fetchError}</p>}
        </div>
      </div>

      {initialData && (
        <MinimalProductForm key={formKey} initialData={initialData} categories={categories} />
      )}
    </div>
  );
}
