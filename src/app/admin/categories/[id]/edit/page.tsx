import { updateCategory } from "../../../actions";
import Link from "next/link";
import { categoryRepository } from "@/lib/repositories/category.repository";
import { notFound } from "next/navigation";

export default async function EditCategoryPage({ params }: { params: { id: string } }) {
  const categories = await categoryRepository.getAll();
  const category = categories.find(c => c.id === params.id);

  if (!category) {
    notFound();
  }

  // Bind the category ID to the server action
  const updateAction = updateCategory.bind(null, category.id);

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/categories" className="text-gray-400 hover:text-gray-900 transition-colors">
          ← Back
        </Link>
        <h1 className="text-3xl font-heading text-gray-900">Edit Category</h1>
      </div>

      <form action={updateAction} className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Category Title</label>
          <input type="text" name="title" id="title" defaultValue={category.title} required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sage focus:border-sage outline-none transition-all" />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
          <input type="text" name="slug" id="slug" defaultValue={category.slug} required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sage focus:border-sage outline-none transition-all" />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea name="description" id="description" defaultValue={category.description} rows={4} required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sage focus:border-sage outline-none transition-all"></textarea>
        </div>

        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
          <input type="url" name="imageUrl" id="imageUrl" defaultValue={category.image} required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sage focus:border-sage outline-none transition-all" placeholder="https://example.com/image.jpg" />
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button type="submit" className="bg-foreground text-white px-6 py-2.5 rounded-md font-medium hover:bg-foreground/90 transition-colors shadow-sm">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
