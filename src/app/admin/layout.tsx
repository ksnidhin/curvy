import Link from "next/link";
import { ROUTES } from "@/lib/config/routes";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col">
        <div className="mb-8">
          <h2 className="text-xl font-heading font-semibold text-foreground">Curvy Girls</h2>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Admin Panel</p>
        </div>

        <nav className="flex-1 space-y-2">
          <Link 
            href="/admin" 
            className="flex items-center space-x-3 px-3 py-2.5 rounded-lg bg-gray-100 text-gray-900 font-medium transition-colors"
          >
            Dashboard
          </Link>
          <Link 
            href="/admin/products" 
            className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium transition-colors"
          >
            Products
          </Link>
          <Link 
            href="/admin/categories" 
            className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium transition-colors"
          >
            Categories
          </Link>
          <Link 
            href="/admin/blog" 
            className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium transition-colors"
          >
            Blog
          </Link>
        </nav>

        <div className="pt-6 border-t border-gray-200 mt-auto">
          <Link 
            href="/" 
            className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            ← Back to Storefront
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
