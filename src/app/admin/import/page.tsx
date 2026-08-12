import { ImportProductClient } from "./ImportProductClient";
import { categoryRepository } from "@/lib/repositories/category.repository";

export default async function ImportProductPage() {
  const categories = await categoryRepository.getAll();
  
  return (
    <div>
      <h1 className="text-2xl font-heading text-gray-900 mb-6">Import Product</h1>
      <div className="max-w-4xl">
        <ImportProductClient categories={categories} />
      </div>
    </div>
  );
}
