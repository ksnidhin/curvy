import { productRepository } from "@/lib/repositories/product.repository";
import { categoryRepository } from "@/lib/repositories/category.repository";
import { blogRepository } from "@/lib/repositories/blog.repository";
import Link from "next/link";
import Image from "next/image";

export default async function AdminDashboard() {
  const products = await productRepository.getAll();
  const categories = await categoryRepository.getAll();
  const blogs = await blogRepository.getAll();

  const recentProducts = products.slice(0, 5);

  return (
    <div>
      <h1 className="text-3xl font-heading text-gray-900 mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Products</h3>
          <p className="text-3xl font-semibold text-gray-900">{products.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Categories</h3>
          <p className="text-3xl font-semibold text-gray-900">{categories.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Blog Posts</h3>
          <p className="text-3xl font-semibold text-gray-900">{blogs.length}</p>
        </div>
      </div>
      
      <div className="mt-12 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Recently Added Products</h3>
          <Link href="/admin/products" className="text-sm text-sage font-medium hover:underline">
            View All
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {recentProducts.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No products added yet.</div>
          ) : (
            recentProducts.map((product) => (
              <div key={product.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50">
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                    <Image
                      src={product.images && product.images.length > 0 ? (typeof product.images[0] === 'string' ? product.images[0] : (product.images[0] as any).url) : "/images/products/placeholder.jpg"}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{product.title}</div>
                    <div className="text-xs text-gray-500">{product.categorySlug}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium text-gray-900">${product.price.toFixed(2)}</span>
                  <Link href={`/admin/products/${product.id}/edit`} className="text-sage hover:text-sage/80 font-medium text-sm">
                    Edit
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
