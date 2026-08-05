'use server'

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { categoryRepository } from '@/lib/repositories/category.repository';
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
