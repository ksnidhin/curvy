'use server'

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { categoryRepository } from '@/lib/repositories/category.repository';
import fs from 'fs/promises';
import path from 'path';

export async function loginAdmin(password: string) {
  // Use a strong alphanumerical secure password
  if (password === 'LivelyBorg2026AdminX9') {
    (await cookies()).set('admin_token', 'authenticated', { secure: true, httpOnly: true, path: '/' });
    return { success: true };
  }
  return { success: false, error: 'Invalid password' };
}

export async function logoutAdmin() {
  (await cookies()).delete('admin_token');
  redirect('/admin/login');
}

import { productRepository } from '@/lib/repositories/product.repository';
import { blogRepository } from '@/lib/repositories/blog.repository';
import { offerRepository } from '@/lib/repositories/offer.repository';
import { AdvancedProduct, ProductOffer } from '@/lib/types/product-advanced';
import crypto from 'crypto';

export async function deleteCategory(id: string) {
  try {
    const category = await categoryRepository.getById(id);
    if (category) {
      // Delete all products associated with this category first
      await productRepository.deleteByCategory(category.slug);
    }
    
    await categoryRepository.delete(id);
    revalidatePath('/admin/categories');
    revalidatePath('/categories');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Failed to delete category:", error);
    return { success: false, error: "Failed to delete category" };
  }
}

export async function createCategory(formData: FormData) {
  try {
    const title = formData.get('title') as string;
    const slug = formData.get('slug') as string;
    const description = formData.get('description') as string;
    const imageUrl = formData.get('imageUrl') as string;

    await categoryRepository.create({
      name: title,
      slug,
      description,
      image: { 
        url: imageUrl || '/images/categories/default.jpg',
        alt: title 
      },
    } as any);

    revalidatePath('/admin/categories');
    revalidatePath('/categories');
    revalidatePath('/');
  } catch (error) {
    console.error("Failed to create category:", error);
    return { success: false, error: "Failed to create category" };
  }
  
  redirect('/admin/categories');
}

export async function updateCategory(id: string, formData: FormData) {
  try {
    const title = formData.get('title') as string;
    const slug = formData.get('slug') as string;
    const description = formData.get('description') as string;
    const imageUrl = formData.get('imageUrl') as string;

    await categoryRepository.update(id, {
      name: title,
      slug,
      description,
      ...(imageUrl && { image: { url: imageUrl, alt: title } }),
    } as any);

    revalidatePath('/admin/categories');
    revalidatePath('/categories');
    revalidatePath('/');
  } catch (error) {
    console.error("Failed to update category:", error);
    return { success: false, error: "Failed to update category" };
  }
  
  redirect('/admin/categories');
}

export async function deleteProduct(id: string) {
  try {
    await productRepository.delete(id);
    revalidatePath('/admin/products');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Failed to delete product:", error);
    return { success: false, error: "Failed to delete product" };
  }
}

export async function deleteBlogPost(id: string) {
  try {
    await blogRepository.delete(id);
    revalidatePath('/admin/blog');
    revalidatePath('/blog');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Failed to delete blog post:", error);
    return { success: false, error: "Failed to delete blog post" };
  }
}
export async function saveAdvancedProduct(id: string | null, payload: any) {
  try {
    const { offers, ...productData } = payload;
    
    let savedProduct;
    if (id) {
      savedProduct = await productRepository.update(id, productData);
    } else {
      savedProduct = await productRepository.create(productData);
    }
    
    if (!savedProduct) {
      return { success: false, error: "Failed to save product core" };
    }

    const productId = savedProduct.id;

    // Handle offers
    if (offers && Array.isArray(offers)) {
      // Get existing offers
      const existingOffers = await offerRepository.getByProductId(productId);
      
      // Update or create offers
      for (const offer of offers) {
        if (offer.id && !offer.id.startsWith('new_')) {
          await offerRepository.update(offer.id, {
            ...offer,
            productId
          });
        } else {
          // create new offer
          const { id: _ignore, ...offerData } = offer;
          await offerRepository.create({
            ...offerData,
            productId,
            syncStatus: 'pending'
          });
        }
      }
      
      // Delete removed offers
      const newOfferIds = offers.map(o => o.id).filter(id => id && !id.startsWith('new_'));
      for (const existing of existingOffers) {
        if (!newOfferIds.includes(existing.id)) {
          await offerRepository.delete(existing.id);
        }
      }
    }

    revalidatePath('/admin/products');
    revalidatePath('/');
    return { success: true, productId };
  } catch (error: any) {
    console.error("Failed to save advanced product:", error);
    return { success: false, error: error.message };
  }
}

// Keeping the old ones for compatibility during migration if needed
export async function createProduct(formData: FormData) {
  try {
    const title = formData.get('title') as string;
    const slug = formData.get('slug') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const brand = formData.get('brand') as string;
    const categorySlug = formData.get('categorySlug') as string;
    const inStock = formData.get('inStock') === 'on';
    const affiliateUrl = formData.get('affiliateUrl') as string;
    const imageUrl = formData.get('imageUrl') as string;
    
    // Support image URLs directly from the form
    const images = imageUrl ? [{ url: imageUrl, alt: title }] : [{ url: '/images/products/placeholder.jpg', alt: 'Placeholder' }];
    
    const details = {
      fabric: "Various",
      care: "Machine wash cold",
      fit: "True to size",
    };

    await productRepository.create({
      title,
      slug,
      description,
      price,
      brand,
      categorySlug,
      inStock,
      affiliateUrl,
      images,
      details,
    });

    revalidatePath('/admin/products');
    revalidatePath('/');
  } catch (error) {
    console.error("Failed to create product:", error);
    return { success: false, error: "Failed to create product" };
  }
  
  redirect('/admin/products');
}

export async function updateProduct(id: string, formData: FormData) {
  try {
    const title = formData.get('title') as string;
    const slug = formData.get('slug') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const brand = formData.get('brand') as string;
    const categorySlug = formData.get('categorySlug') as string;
    const inStock = formData.get('inStock') === 'on';
    const affiliateUrl = formData.get('affiliateUrl') as string;
    const imageUrl = formData.get('imageUrl') as string;
    
    const images = imageUrl ? [{ url: imageUrl, alt: title }] : undefined;

    await productRepository.update(id, {
      title,
      slug,
      description,
      price,
      brand,
      categorySlug,
      inStock,
      affiliateUrl,
      ...(images && { images }),
    });

    revalidatePath('/admin/products');
    revalidatePath('/');
  } catch (error) {
    console.error("Failed to update product:", error);
    return { success: false, error: "Failed to update product" };
  }
  
  redirect('/admin/products');
}

export async function createBlogPost(formData: FormData) {
  try {
    const title = formData.get('title') as string;
    const slug = formData.get('slug') as string;
    const excerpt = formData.get('excerpt') as string;
    const content = formData.get('content') as string;
    const imageUrl = formData.get('imageUrl') as string;

    await blogRepository.create({
      title,
      slug,
      excerpt,
      content,
      coverImage: imageUrl || '/images/blog/default.jpg',
      author: "Admin",
    });

    revalidatePath('/admin/blog');
    revalidatePath('/blog');
    revalidatePath('/');
  } catch (error) {
    console.error("Failed to create blog post:", error);
    return { success: false, error: "Failed to create blog post" };
  }
  
  redirect('/admin/blog');
}

export async function updateBlogPost(id: string, formData: FormData) {
  try {
    const title = formData.get('title') as string;
    const slug = formData.get('slug') as string;
    const excerpt = formData.get('excerpt') as string;
    const content = formData.get('content') as string;
    const imageUrl = formData.get('imageUrl') as string;

    await blogRepository.update(id, {
      title,
      slug,
      excerpt,
      content,
      ...(imageUrl && { coverImage: imageUrl }),
    });

    revalidatePath('/admin/blog');
    revalidatePath('/blog');
    revalidatePath('/');
  } catch (error) {
    console.error("Failed to update blog post:", error);
    return { success: false, error: "Failed to update blog post" };
  }
  
  redirect('/admin/blog');
}

export async function saveMinimalProduct(formData: FormData) {
  try {
    const id = formData.get('id') as string | null;
    const title = formData.get('title') as string;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    // Parse filters
    const availableSizes = (formData.get('availableSizes') as string)?.split(',').map(s => s.trim()).filter(Boolean) || [];
    const colors = (formData.get('colors') as string)?.split(',').map(s => s.trim()).filter(Boolean) || [];
    const clothType = formData.get('clothType') as string;
    const occasion = formData.get('occasion') as string;

    const storeName = formData.get('storeName') as string;

    const productData: any = {
      title,
      brand: formData.get('brand') as string,
      categorySlug: formData.get('categorySlug') as string,
      description: formData.get('description') as string,
      status: 'published',
      storeName,
      attributes: {
        availableSizes,
        colors,
        clothType,
        occasion
      },
      seo: {
        metaTitle: title
      }
    };

    // Handle File Uploads
    const imageFiles = formData.getAll('imageFiles') as File[];
    const removedImages = formData.getAll('removedImages') as string[];
    
    // Start with existing images if editing
    let currentImages: any[] = [];
    if (id) {
      const existing = await productRepository.getById(id);
      if (existing?.images) {
        currentImages = [...existing.images];
      }
    }

    // Remove deleted images
    if (removedImages.length > 0) {
      currentImages = currentImages.filter(img => {
        const url = typeof img === 'string' ? img : img.url;
        return !removedImages.includes(url);
      });
    }
    
    console.log("saveMinimalProduct received imageFiles count:", imageFiles.length);

    // Add new images
    for (const imageFile of imageFiles) {
      console.log("Processing imageFile:", typeof imageFile, imageFile ? imageFile.name : 'null', imageFile ? imageFile.size : 0);
      if (imageFile && imageFile.size > 0) {
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        const safeName = imageFile.name ? imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '') : 'upload.jpg';
        const fileName = `${Date.now()}-${safeName}`;
        const uploadDir = path.join(process.cwd(), 'public/images/products');
        
        try {
          await fs.access(uploadDir);
        } catch {
          await fs.mkdir(uploadDir, { recursive: true });
        }
        
        const filePath = path.join(uploadDir, fileName);
        await fs.writeFile(filePath, buffer);
        
        currentImages.push({
          id: fileName,
          url: `/images/products/${fileName}`,
          alt: title,
          isPrimary: currentImages.length === 0,
          order: currentImages.length
        });
      }
    }

    // Handle external images
    const externalImages = formData.getAll('externalImages') as string[];
    if (externalImages.length > 0) {
      console.log("saveMinimalProduct downloading external images:", externalImages.length);
      for (const imageUrl of externalImages) {
        if (!imageUrl) continue;
        try {
          // Use realistic headers to avoid blocking
          const res = await fetch(imageUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
            }
          });
          if (!res.ok) continue;
          
          const arrayBuffer = await res.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          
          const fileName = `${Date.now()}-ext-${Math.floor(Math.random() * 10000)}.jpg`;
          const uploadDir = path.join(process.cwd(), 'public/images/products');
          
          try {
            await fs.access(uploadDir);
          } catch {
            await fs.mkdir(uploadDir, { recursive: true });
          }
          
          const filePath = path.join(uploadDir, fileName);
          await fs.writeFile(filePath, buffer);
          
          currentImages.push({
            id: fileName,
            url: `/images/products/${fileName}`,
            alt: title,
            isPrimary: currentImages.length === 0,
            order: currentImages.length
          });
        } catch (err) {
          console.error("Failed to download external image:", imageUrl, err);
        }
      }
    }

    productData.images = currentImages;

    // Save core product
    let savedProduct;
    if (id) {
      const existing = await productRepository.getById(id);
      if (existing && !existing.slug) {
        productData.slug = slug;
      }
      savedProduct = await productRepository.update(id, productData);
    } else {
      productData.slug = slug;
      savedProduct = await productRepository.create(productData);
    }

    if (!savedProduct) {
      return { success: false, error: 'Failed to save product' };
    }

    // Handle single Offer for pricing and stock
    const inStock = formData.get('inStock') === 'true';
    const price = parseFloat(formData.get('price') as string);
    const affiliateUrl = formData.get('affiliateUrl') as string;

    // We must import offerRepository at the top, but we'll assume it's already there since this file has saveAdvancedProduct.
    const { offerRepository } = await import('@/lib/repositories/offer.repository');

    const existingOffers = await offerRepository.getByProductId(savedProduct.id);
    const defaultOfferId = existingOffers?.[0]?.id;

    const offerData = {
      productId: savedProduct.id,
      storeId: 'default-store',
      url: affiliateUrl,
      affiliateUrl: affiliateUrl,
      price: price,
      inStock: inStock,
      syncStatus: 'success'
    };

    if (defaultOfferId) {
      await offerRepository.update(defaultOfferId, offerData);
    } else {
      await offerRepository.create(offerData as any);
    }

    // Revalidate Cache
    const { revalidatePath } = await import('next/cache');
    revalidatePath('/admin/products');
    revalidatePath('/products');
    revalidatePath('/');
    
    return { success: true };
  } catch (error: any) {
    console.error("Minimal product save error:", error);
    return { success: false, error: error.message || "An unexpected error occurred" };
  }
}

export async function saveMinimalCategory(formData: FormData) {
  try {
    const id = formData.get('id') as string | null;
    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const description = formData.get('description') as string;

    const categoryData: any = {
      name,
      slug,
      description
    };

    // Handle File Upload
    const imageFile = formData.get('imageFile') as File | null;
    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const safeName = imageFile.name ? imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '') : 'upload.jpg';
      const fileName = `cat-${Date.now()}-${safeName}`;
      const uploadDir = path.join(process.cwd(), 'public/images/categories');
      
      try {
        await fs.access(uploadDir);
      } catch {
        await fs.mkdir(uploadDir, { recursive: true });
      }
      
      const filePath = path.join(uploadDir, fileName);
      await fs.writeFile(filePath, buffer);
      
      categoryData.image = {
        url: `/images/categories/${fileName}`,
        alt: name
      };
    } else if (!id) {
      categoryData.image = {
        url: "/images/categories/placeholder.jpg",
        alt: name
      };
    }

    let savedCategory;
    if (id) {
      if (formData.get('removeImage') === 'true') {
        categoryData.image = null;
      } else if (!categoryData.image) {
        const existing = await categoryRepository.getById(id);
        if (existing?.image) {
          categoryData.image = existing.image;
        }
      }
      savedCategory = await categoryRepository.update(id, categoryData);
    } else {
      categoryData.id = `cat-${Date.now()}`;
      savedCategory = await categoryRepository.create(categoryData);
    }

    if (!savedCategory) {
      return { success: false, error: 'Failed to save category' };
    }

    // Revalidate Cache
    const { revalidatePath } = await import('next/cache');
    revalidatePath('/admin/categories');
    revalidatePath('/categories');
    revalidatePath('/');
    
    return { success: true };
  } catch (error: any) {
    console.error("Minimal category save error:", error);
    return { success: false, error: error.message || "An unexpected error occurred" };
  }
}

export async function saveHeroImages(formData: FormData) {
  try {
    const { settingsRepository } = await import('@/lib/repositories/settings.repository');
    const imageFiles = formData.getAll('imageFiles') as File[];
    const removedImages = formData.getAll('removedImages') as string[];
    
    const settings = await settingsRepository.getSiteSettings();
    let currentImages = [...(settings.heroImages || [])];

    // Remove deleted images
    if (removedImages.length > 0) {
      currentImages = currentImages.filter(url => !removedImages.includes(url));
    }

    // Add new images
    for (const imageFile of imageFiles) {
      if (imageFile && imageFile.size > 0) {
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        const safeName = imageFile.name ? imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '') : 'upload.jpg';
        const fileName = `hero-${Date.now()}-${safeName}`;
        const uploadDir = path.join(process.cwd(), 'public/images/hero');
        
        try {
          await fs.access(uploadDir);
        } catch {
          await fs.mkdir(uploadDir, { recursive: true });
        }
        
        const filePath = path.join(uploadDir, fileName);
        await fs.writeFile(filePath, buffer);
        
        currentImages.push(`/images/hero/${fileName}`);
      }
    }

    await settingsRepository.updateSiteSettings({ heroImages: currentImages });

    const { revalidatePath } = await import('next/cache');
    revalidatePath('/');
    revalidatePath('/admin/settings/hero');
    
    return { success: true };
  } catch (error: any) {
    console.error("Hero images save error:", error);
    return { success: false, error: error.message || "An unexpected error occurred" };
  }
}
