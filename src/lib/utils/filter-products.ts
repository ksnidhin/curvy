import { Product } from "@/lib/types/product";

export function filterAndSortProducts(
  products: Product[],
  searchParams: { [key: string]: string | string[] | undefined }
): Product[] {
  let result = [...products];

  // 1. Filter by Size
  const sizesParam = searchParams.sizes;
  if (sizesParam && typeof sizesParam === "string") {
    const sizes = sizesParam.split(",");
    result = result.filter(
      (p) =>
        p.attributes?.availableSizes &&
        p.attributes.availableSizes.some((s) => sizes.includes(s))
    );
  }

  // 2. Filter by Occasion
  const occasionsParam = searchParams.occasions;
  if (occasionsParam && typeof occasionsParam === "string") {
    const occasions = occasionsParam.split(",");
    result = result.filter(
      (p) =>
        p.attributes?.occasion &&
        occasions.includes(p.attributes.occasion)
    );
  }

  // 3. Sort
  const sortParam = searchParams.sort;
  if (sortParam === "price_asc") {
    result.sort((a, b) => a.price - b.price);
  } else if (sortParam === "price_desc") {
    result.sort((a, b) => b.price - a.price);
  } else {
    // Default to newest (already sorted by createdAt in repository, but we can enforce)
    result.sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  return result;
}
