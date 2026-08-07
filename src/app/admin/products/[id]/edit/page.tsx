import Link from "next/link";
import { productRepository } from "@/lib/repositories/product.repository";
import { notFound } from "next/navigation";
import { MinimalProductForm } from "@/components/admin/MinimalProductForm";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const products = await productRepository.getAll();
  const product = products.find(p => p.id === params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/products" className="text-gray-400 hover:text-gray-900 transition-colors">
          ← Back
        </Link>
        <h1 className="text-3xl font-heading text-gray-900">Edit Product: {product.title}</h1>
      </div>

      <MinimalProductForm initialData={product} />
    </div>
  );
}
