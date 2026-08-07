import { MinimalCategoryForm } from "@/components/admin/MinimalCategoryForm";
import Link from "next/link";

export default function NewCategoryPage() {
  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/categories" className="text-gray-400 hover:text-gray-900 transition-colors">
          ← Back
        </Link>
        <h1 className="text-3xl font-heading text-gray-900">Add New Category</h1>
      </div>

      <MinimalCategoryForm />
    </div>
  );
}
