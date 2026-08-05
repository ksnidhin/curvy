'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdvancedProduct, ProductOffer } from '@/lib/types/product-advanced';
import { saveAdvancedProduct } from '@/app/admin/actions';

interface AdvancedProductFormProps {
  initialData?: any;
  stores?: any[];
}

export function AdvancedProductForm({ initialData, stores = [] }: AdvancedProductFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<any>({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    brand: initialData?.brand || '',
    categorySlug: initialData?.categorySlug || 'dresses',
    description: initialData?.description || '',
    status: initialData?.status || 'published',
    isFeatured: initialData?.isFeatured || false,
    images: initialData?.images || [],
    attributes: initialData?.attributes || {},
    seo: initialData?.seo || {},
    offers: initialData?.offers || []
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    if (name.startsWith('seo.')) {
      const seoField = name.split('.')[1];
      setFormData({ ...formData, seo: { ...formData.seo, [seoField]: value } });
    } else if (name.startsWith('attr.')) {
      const attrField = name.split('.')[1];
      setFormData({ ...formData, attributes: { ...formData.attributes, [attrField]: value } });
    } else {
      setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    }
  };

  const handleAddOffer = () => {
    setFormData({
      ...formData,
      offers: [...formData.offers, { id: `new_${Date.now()}`, storeId: '', url: '', price: 0, affiliateUrl: '', inStock: true }]
    });
  };

  const handleOfferChange = (index: number, field: string, value: any) => {
    const updatedOffers = [...formData.offers];
    updatedOffers[index] = { ...updatedOffers[index], [field]: value };
    setFormData({ ...formData, offers: updatedOffers });
  };

  const handleRemoveOffer = (index: number) => {
    const updatedOffers = [...formData.offers];
    updatedOffers.splice(index, 1);
    setFormData({ ...formData, offers: updatedOffers });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const res = await saveAdvancedProduct(initialData?.id || null, formData);
    
    if (res.success) {
      router.push('/admin/products');
    } else {
      setError(res.error || 'Failed to save product');
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'images', label: 'Images' },
    { id: 'offers', label: 'Offers & Pricing' },
    { id: 'attributes', label: 'Attributes' },
    { id: 'seo', label: 'SEO' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-border">
      <div className="border-b border-border">
        <nav className="flex space-x-4 px-4 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={(e) => { e.preventDefault(); setActiveTab(tab.id); }}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted hover:text-foreground hover:border-border'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        {error && (
          <div className="mb-6 p-4 bg-rose/10 border border-rose/20 text-rose rounded-md">
            {error}
          </div>
        )}

        {/* GENERAL TAB */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Product Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Slug (URL friendly)</label>
                <input
                  type="text"
                  name="slug"
                  required
                  value={formData.slug}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Brand</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Category</label>
                <select
                  name="categorySlug"
                  value={formData.categorySlug}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="dresses">Dresses</option>
                  <option value="tops">Tops</option>
                  <option value="jeans">Jeans & Bottoms</option>
                  <option value="kurtis">Kurtis & Traditional</option>
                  <option value="nightwear">Nightwear</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="hidden">Hidden</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Description</label>
              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isFeatured"
                id="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
                className="h-4 w-4 text-primary rounded border-border"
              />
              <label htmlFor="isFeatured" className="ml-2 block text-sm text-foreground">
                Feature on Homepage
              </label>
            </div>
          </div>
        )}

        {/* IMAGES TAB */}
        {activeTab === 'images' && (
          <div className="space-y-6">
            <p className="text-sm text-muted mb-4">Add image URLs for this product. In the future, this will support direct uploads.</p>
            
            {formData.images.map((img: any, i: number) => (
              <div key={i} className="flex gap-4 items-start p-4 border border-border rounded-md bg-accent/30">
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Image URL</label>
                    <input
                      type="text"
                      value={img.url}
                      onChange={(e) => {
                        const newImages = [...formData.images];
                        newImages[i].url = e.target.value;
                        setFormData({ ...formData, images: newImages });
                      }}
                      className="w-full px-3 py-1.5 text-sm border border-border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Alt Text</label>
                    <input
                      type="text"
                      value={img.alt}
                      onChange={(e) => {
                        const newImages = [...formData.images];
                        newImages[i].alt = e.target.value;
                        setFormData({ ...formData, images: newImages });
                      }}
                      className="w-full px-3 py-1.5 text-sm border border-border rounded-md"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newImages = [...formData.images];
                    newImages.splice(i, 1);
                    setFormData({ ...formData, images: newImages });
                  }}
                  className="p-2 text-rose bg-rose/10 rounded-md hover:bg-rose/20"
                >
                  Remove
                </button>
              </div>
            ))}
            
            <button
              type="button"
              onClick={() => setFormData({
                ...formData,
                images: [...formData.images, { url: '', alt: formData.title || 'Product image', isPrimary: formData.images.length === 0 }]
              })}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium"
            >
              + Add Image URL
            </button>
          </div>
        )}

        {/* OFFERS TAB */}
        {activeTab === 'offers' && (
          <div className="space-y-6">
            <p className="text-sm text-muted mb-4">Add multiple store offers for this product. The storefront will automatically display the lowest price.</p>
            
            {formData.offers.map((offer: any, i: number) => (
              <div key={i} className="p-4 border border-border rounded-md bg-accent/30 space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-sm">Offer #{i + 1}</h4>
                  <button
                    type="button"
                    onClick={() => handleRemoveOffer(i)}
                    className="text-xs text-rose hover:underline"
                  >
                    Remove Offer
                  </button>
                </div>
                
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Store Name/ID</label>
                    <input
                      type="text"
                      value={offer.storeId}
                      onChange={(e) => handleOfferChange(i, 'storeId', e.target.value)}
                      placeholder="e.g. Myntra, Amazon"
                      className="w-full px-3 py-1.5 text-sm border border-border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Price (INR)</label>
                    <input
                      type="number"
                      value={offer.price}
                      onChange={(e) => handleOfferChange(i, 'price', parseFloat(e.target.value))}
                      className="w-full px-3 py-1.5 text-sm border border-border rounded-md"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Source URL</label>
                  <input
                    type="url"
                    value={offer.url}
                    onChange={(e) => handleOfferChange(i, 'url', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-border rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Affiliate Link</label>
                  <input
                    type="url"
                    value={offer.affiliateUrl}
                    onChange={(e) => handleOfferChange(i, 'affiliateUrl', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-border rounded-md"
                  />
                </div>
              </div>
            ))}
            
            <button
              type="button"
              onClick={handleAddOffer}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium"
            >
              + Add Offer
            </button>
          </div>
        )}

        {/* ATTRIBUTES TAB */}
        {activeTab === 'attributes' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Cloth Type</label>
                <input
                  type="text"
                  name="attr.clothType"
                  value={formData.attributes.clothType || ''}
                  onChange={handleChange}
                  placeholder="e.g. Cotton, Silk, Chiffon"
                  className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Neckline</label>
                <input
                  type="text"
                  name="attr.neckline"
                  value={formData.attributes.neckline || ''}
                  onChange={handleChange}
                  placeholder="e.g. V-Neck, Round, Halter"
                  className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Sleeve Type</label>
                <input
                  type="text"
                  name="attr.sleeveType"
                  value={formData.attributes.sleeveType || ''}
                  onChange={handleChange}
                  placeholder="e.g. Sleeveless, Full Sleeve"
                  className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Length</label>
                <input
                  type="text"
                  name="attr.length"
                  value={formData.attributes.length || ''}
                  onChange={handleChange}
                  placeholder="e.g. Maxi, Midi, Mini"
                  className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>
        )}

        {/* SEO TAB */}
        {activeTab === 'seo' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Meta Title</label>
              <input
                type="text"
                name="seo.metaTitle"
                value={formData.seo.metaTitle || ''}
                onChange={handleChange}
                placeholder="Leave blank to use product title"
                className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Meta Description</label>
              <textarea
                name="seo.metaDescription"
                rows={3}
                value={formData.seo.metaDescription || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Canonical URL</label>
              <input
                type="url"
                name="seo.canonicalUrl"
                value={formData.seo.canonicalUrl || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-border flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 text-foreground font-medium rounded-button hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-2 bg-foreground text-white font-medium rounded-button hover:bg-foreground/90 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
