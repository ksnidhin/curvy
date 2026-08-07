import { MinimalProductForm } from "@/components/admin/MinimalProductForm";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="text-2xl font-heading text-gray-900 mb-6">Add New Product</h1>
      <div className="max-w-4xl">
        <MinimalProductForm />
      </div>
    </div>
  );
}
