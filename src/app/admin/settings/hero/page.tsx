'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { saveHeroImages } from '@/app/admin/actions';
import { useRouter } from 'next/navigation';

export default function HeroSettingsPage() {
  const [initialImages, setInitialImages] = useState<string[]>([]);
  const [previewUrls, setPreviewUrls] = useState<{url: string, file?: File, isExisting?: boolean}[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Fetch current settings
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data && data.heroImages) {
          setInitialImages(data.heroImages);
          setPreviewUrls(data.heroImages.map((url: string) => ({ url, isExisting: true })));
        }
      })
      .catch(err => console.error("Failed to load settings", err));
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newPreviews = files.map(file => ({
        url: URL.createObjectURL(file),
        file
      }));
      setPreviewUrls(prev => [...prev, ...newPreviews]);
    }
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
    setSuccess('');

    try {
      const formData = new FormData();
      
      // Append files that were added
      previewUrls.forEach(preview => {
        if (preview.file) {
          formData.append('imageFiles', preview.file);
        }
      });

      // Append removed existing images
      removedImages.forEach(url => {
        formData.append('removedImages', url);
      });
      
      const res = await saveHeroImages(formData);
      
      if (res.success) {
        setSuccess('Hero images updated successfully!');
        setRemovedImages([]);
        // Re-fetch to clear blob URLs and use real URLs
        router.refresh();
      } else {
        setError(res.error || 'Failed to save images');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-heading text-gray-900">Hero Slider Images</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-medium text-gray-900">Manage Slideshow</h2>
          <p className="text-sm text-gray-500 mt-1">Upload multiple images to be displayed as a fading slideshow on the home page.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
              {error}
            </div>
          )}
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 text-green-600 rounded-md">
              {success}
            </div>
          )}

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
              <p className="mt-2 text-xs text-gray-500">Upload portrait images (e.g. 4:5 ratio) for best results.</p>
            </div>
            
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Current Slides ({previewUrls.length})</h3>
              {previewUrls.length === 0 ? (
                <div className="text-sm text-gray-500 italic">No images currently set. A default placeholder will be used.</div>
              ) : (
                <div className="flex flex-wrap gap-4">
                  {previewUrls.map((preview, idx) => (
                    <div key={idx} className="relative w-40 h-56 shrink-0 flex flex-col gap-2">
                      <div className="relative w-full h-full rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                        <Image src={preview.url} alt={`Slide ${idx + 1}`} fill className="object-cover" />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="text-xs text-red-600 hover:text-red-800 font-medium text-center w-full bg-red-50 py-1 rounded"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-foreground text-white px-6 py-2 rounded-md font-medium text-sm hover:bg-foreground/90 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
