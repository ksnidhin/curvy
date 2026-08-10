'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveMinimalCategory } from '@/app/admin/actions';
import Image from 'next/image';

interface MinimalCategoryFormProps {
  initialData?: {
    id: string;
    slug: string;
    name: string;
    image?: { url: string; alt?: string } | string;
    description?: string;
  };
}

export function MinimalCategoryForm({ initialData }: MinimalCategoryFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Extract URL correctly whether image is a string or an object
  const initialImageUrl = typeof initialData?.image === 'string' 
    ? initialData.image 
    : initialData?.image?.url;
    
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImageUrl || null);
  const [removeImage, setRemoveImage] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      setRemoveImage(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    setRemoveImage(true);
    // Also clear the file input if needed
    const fileInput = document.querySelector('input[name="imageFile"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const formData = new FormData(e.currentTarget);
      if (initialData?.id) {
        formData.append('id', initialData.id);
      }
      if (removeImage) {
        formData.append('removeImage', 'true');
      }
      
      const res = await saveMinimalCategory(formData);
      
      if (res.success) {
        router.push('/admin/categories');
      } else {
        setError(res.error || 'Failed to save category');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-medium text-gray-900">Category Details</h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="name"
              required
              defaultValue={initialData?.name}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-sage focus:border-sage"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
            <input
              type="text"
              name="slug"
              required
              defaultValue={initialData?.slug}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-sage focus:border-sage"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
          <textarea
            name="description"
            rows={3}
            defaultValue={initialData?.description}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-sage focus:border-sage"
          />
        </div>

        {/* Media Upload */}
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Category Image</h3>
          <div className="flex items-start space-x-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload File</label>
              <input
                type="file"
                name="imageFile"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-sage/10 file:text-sage hover:file:bg-sage/20"
              />
              <p className="mt-2 text-xs text-gray-500">Upload a square or portrait image (JPG, PNG).</p>
            </div>
            {previewUrl && (
              <div className="relative w-32 h-40 shrink-0 flex flex-col gap-2">
                <div className="relative w-full h-full rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                  <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                </div>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="text-xs text-red-600 hover:text-red-800 font-medium text-center w-full"
                >
                  Remove Image
                </button>
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
            {isSubmitting ? 'Saving...' : (initialData?.id ? 'Save Changes' : 'Create Category')}
          </button>
        </div>
      </form>
    </div>
  );
}
