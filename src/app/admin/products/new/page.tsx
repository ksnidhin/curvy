import { MinimalProductForm } from "@/components/admin/MinimalProductForm";
import { categoryRepository } from "@/lib/repositories/category.repository";

export default async function NewProductPage() {
  const categories = await categoryRepository.getAll();
  
  return (
    <div>
      <h1 className="text-2xl font-heading text-gray-900 mb-6">Add New Product</h1>
      <div className="max-w-4xl">
        <MinimalProductForm categories={categories} />
      </div>
    </div>
  );
}
