import { NextResponse } from "next/server";
import { affiliateService } from "@/lib/services/affiliate.service";
import { ROUTES } from "@/lib/config/routes";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!slug) {
    return NextResponse.redirect(new URL(ROUTES.home, request.url));
  }

  // Phase 1: Log click (no-op in phase 1, but calls the service)
  await affiliateService.logClick(slug);

  // Get the redirect URL
  const url = await affiliateService.getRedirectUrl(slug);

  if (url) {
    return NextResponse.redirect(url, 302);
  }

  // Fallback if product not found or no affiliate URL
  return NextResponse.redirect(new URL(ROUTES.home, request.url));
}
