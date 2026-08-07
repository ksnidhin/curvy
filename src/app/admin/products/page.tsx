import { productRepository } from "@/lib/repositories/product.repository";
import Image from "next/image";
import Link from "next/link";
import { DeleteProductButton } from "../components/DeleteProductButton";

export default async function AdminProducts() {
  const products = await productRepository.getAll();

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-heading text-gray-900">Products</h1>
        <Link href="/admin/products/new" className="bg-foreground text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-foreground/90 transition-colors">
          Add New Product
        </Link>
      </div>
      
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-900 font-medium">
            <tr>
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No products found in the database.
                </td>
              </tr>
            )}
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-16 rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                      <Image
                        src={product.images?.[0]?.url || (typeof product.images?.[0] === 'string' ? product.images[0] : "/images/products/placeholder.jpg")}
                        alt={product.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{product.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{product.brand}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">
                  {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(product.price)}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {product.categorySlug}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {product.inStock ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200/50">
                      In Stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200/50">
                      Out of Stock
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
<Link href={`/admin/products/${product.id}/edit`} className="text-sage hover:text-sage/80 font-medium mr-4">Edit</Link>
                  <DeleteProductButton id={product.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
