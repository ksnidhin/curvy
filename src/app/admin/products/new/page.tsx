import Link from "next/link";
import { categoryRepository } from "@/lib/repositories/category.repository";
import { storeRepository } from "@/lib/repositories/store.repository";
import { AdvancedProductForm } from "@/components/admin/AdvancedProductForm";

export default async function NewProductPage() {
  const categories = await categoryRepository.getAll();
  const stores = await storeRepository.getAll();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/products" className="text-gray-400 hover:text-gray-900 transition-colors">
          ← Back
        </Link>
        <h1 className="text-3xl font-heading text-gray-900">Add New Product</h1>
      </div>

      <AdvancedProductForm stores={stores} />
    </div>
  );
}
