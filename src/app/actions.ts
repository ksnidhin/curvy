'use server'

import { newsletterRepository } from "@/lib/repositories/newsletter.repository";

export async function subscribeToNewsletter(email: string) {
  try {
    const success = await newsletterRepository.subscribe(email);
    return { success };
  } catch (error) {
    console.error("Failed to subscribe:", error);
    return { success: false, error: "Failed to subscribe" };
  }
}

import { searchService } from "@/lib/services/search.service";

export async function performSearchAction(query: string) {
  try {
    return await searchService.search(query);
  } catch (error) {
    console.error("Search failed:", error);
    return { products: [], categories: [], blogs: [], total: 0 };
  }
}

import { productRepository } from '@/lib/repositories/product.repository';

export async function getProductsByIds(ids: string[]) {
  if (!ids || ids.length === 0) return [];
  const products = await productRepository.getAll();
  return products.filter(p => ids.includes(p.id));
}

