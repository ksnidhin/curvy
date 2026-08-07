import { MinimalCategoryForm } from "@/components/admin/MinimalCategoryForm";
import Link from "next/link";
import { categoryRepository } from "@/lib/repositories/category.repository";
import { notFound } from "next/navigation";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const categories = await categoryRepository.getAll();
  const category = categories.find(c => c.id === id);

  if (!category) {
    notFound();
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/categories" className="text-gray-400 hover:text-gray-900 transition-colors">
          ← Back
        </Link>
        <h1 className="text-3xl font-heading text-gray-900">Edit Category</h1>
      </div>

      <MinimalCategoryForm initialData={category} />
    </div>
  );
}
