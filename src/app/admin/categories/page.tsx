import Link from "next/link";
import { categoryRepository } from "@/lib/repositories/category.repository";
import { deleteCategory } from "../actions";
import Image from "next/image";

export default async function AdminCategories() {
  const categories = await categoryRepository.getAll();

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-heading text-gray-900">Categories</h1>
        <Link href="/admin/categories/new" className="bg-foreground text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-foreground/90 transition-colors">
          Add New Category
        </Link>
      </div>
      
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm font-medium">
            <tr>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 relative rounded-md overflow-hidden bg-gray-100">
                      <Image 
                        src={category.image} 
                        alt={category.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{category.title}</p>
                      <p className="text-sm text-gray-500">{category.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <span className="line-clamp-2">{category.description}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-3">
                    <Link href={`/admin/categories/${category.id}/edit`} className="text-sage hover:text-sage/80 font-medium text-sm">
                      Edit
                    </Link>
                    <form action={async () => {
                      'use server'
                      await deleteCategory(category.id);
                    }}>
                      <button className="text-rose hover:text-rose/80 font-medium text-sm">
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                  No categories found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
