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
