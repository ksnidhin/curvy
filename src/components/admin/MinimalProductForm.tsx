'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveMinimalProduct } from '@/app/admin/actions';
import { Product } from '@/lib/types/product';
import { Category } from '@/lib/types/category';
import Image from 'next/image';

interface MinimalProductFormProps {
  initialData?: Product;
  categories?: Category[];
}

export function MinimalProductForm({ initialData, categories = [] }: MinimalProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [inStock, setInStock] = useState(initialData?.inStock ?? true);
  const [previewUrls, setPreviewUrls] = useState<{url: string, file?: File, isExisting?: boolean, isExternal?: boolean}[]>(
    initialData?.images?.map(img => {
      const url = typeof img === 'string' ? img : img.url;
      const isExternal = url.startsWith('http');
      return { url, isExisting: !isExternal, isExternal };
    }) || []
  );
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newPreviews = files.map(file => ({
        url: URL.createObjectURL(file),
        file
      }));
      setPreviewUrls(prev => [...prev, ...newPreviews]);
    }
    // Clear input so same files can be selected again if removed
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setPreviewUrls(prev => {
      const target = prev[index];
      if (target.isExisting) {
        setRemovedImages(curr => [...curr, target.url]);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const formData = new FormData(e.currentTarget);
      formData.append('inStock', inStock.toString());
      if (initialData?.id) {
        formData.append('id', initialData.id);
      }
      
      // Append files that were added
      previewUrls.forEach(preview => {
        if (preview.file) {
          formData.append('imageFiles', preview.file);
        } else if (preview.isExternal) {
          formData.append('externalImages', preview.url);
        }
      });

      // Append removed existing images
      removedImages.forEach(url => {
        formData.append('removedImages', url);
      });
      
      // We don't want the default single file upload to interfere
      formData.delete('imageFile');

      const res = await saveMinimalProduct(formData);
      
      if (res.success) {
        router.push('/admin/products');
      } else {
        setError(res.error || 'Failed to save product');
        setIsSubmitting(false);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-medium text-gray-900">Product Details</h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
            {error}
          </div>
        )}



        {/* Basic Info */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              name="title"
              required
              defaultValue={initialData?.title}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-sage focus:border-sage"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
            <input
              type="text"
              name="brand"
              defaultValue={initialData?.brand}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-sage focus:border-sage"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              name="categorySlug"
              defaultValue={initialData?.categorySlug || categories[0]?.slug || ''}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-sage focus:border-sage"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Occasion</label>
            <select
              name="occasion"
              defaultValue={initialData?.attributes?.occasion || 'casual'}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-sage focus:border-sage"
            >
              <option value="casual">Casual</option>
              <option value="formal">Formal</option>
              <option value="party">Party</option>
              <option value="ethnic">Ethnic</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            rows={4}
            defaultValue={initialData?.description}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-sage focus:border-sage"
          />
        </div>

        {/* Filters (Sizes, Colors, Fabric) */}
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Available Sizes (comma separated)</label>
              <input
                type="text"
                name="availableSizes"
                placeholder="XS, S, M, L, XL"
                defaultValue={initialData?.attributes?.availableSizes?.join(', ')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-sage focus:border-sage"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Colors (comma separated)</label>
              <input
                type="text"
                name="colors"
                placeholder="Red, Blue, Black"
                defaultValue={initialData?.attributes?.colors?.join(', ')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-sage focus:border-sage"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fabric / Cloth Type</label>
              <input
                type="text"
                name="clothType"
                placeholder="Cotton, Silk, etc."
                defaultValue={initialData?.attributes?.clothType}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-sage focus:border-sage"
              />
            </div>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing & Stock</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <input
                type="number"
                step="0.01"
                name="price"
                required
                defaultValue={initialData?.price}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-sage focus:border-sage"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
              <input
                type="text"
                name="storeName"
                placeholder="e.g. Myntra, Amazon"
                required
                defaultValue={initialData?.storeName}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-sage focus:border-sage"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Affiliate Link</label>
              <input
                type="url"
                name="affiliateUrl"
                placeholder="https://"
                required
                defaultValue={initialData?.affiliateUrl}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-sage focus:border-sage"
              />
            </div>
          </div>
          <div className="mt-6 flex items-center">
            <button
              type="button"
              onClick={() => setInStock(!inStock)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                inStock ? 'bg-sage' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  inStock ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="ml-3 text-sm font-medium text-gray-900">
              {inStock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
        </div>

        {/* Media Upload */}
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Product Images</h3>
          <div className="flex flex-col space-y-6">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Files</label>
              <input
                type="file"
                name="imageFile"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-sage/10 file:text-sage hover:file:bg-sage/20"
              />
              <p className="mt-2 text-xs text-gray-500">Upload multiple square or portrait images (JPG, PNG).</p>
            </div>
            
            {previewUrls.length > 0 && (
              <div className="flex flex-wrap gap-4">
                {previewUrls.map((preview, idx) => (
                  <div key={idx} className="relative w-32 h-40 shrink-0 flex flex-col gap-2">
                    <div className="relative w-full h-full rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                      <img src={preview.url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="text-xs text-red-600 hover:text-red-800 font-medium text-center w-full"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-6 border-t border-gray-200 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-sage text-white rounded-md font-medium hover:bg-sage/90 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : (initialData?.id ? 'Save Changes' : 'Create Product')}
          </button>
        </div>
      </form>
    </div>
  );
}
