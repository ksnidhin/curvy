import { updateBlogPost } from "../../../actions";
import Link from "next/link";
import { blogRepository } from "@/lib/repositories/blog.repository";
import { notFound } from "next/navigation";

export default async function EditBlogPage({ params }: { params: { id: string } }) {
  const posts = await blogRepository.getAll();
  const post = posts.find(p => p.id === params.id);

  if (!post) {
    notFound();
  }

  const updateAction = updateBlogPost.bind(null, post.id);

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/blog" className="text-gray-400 hover:text-gray-900 transition-colors">
          ← Back
        </Link>
        <h1 className="text-3xl font-heading text-gray-900">Edit Blog Post</h1>
      </div>

      <form action={updateAction} className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Post Title</label>
          <input type="text" name="title" id="title" defaultValue={post.title} required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sage focus:border-sage outline-none transition-all" />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
          <input type="text" name="slug" id="slug" defaultValue={post.slug} required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sage focus:border-sage outline-none transition-all" />
        </div>

        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
          <input type="url" name="imageUrl" id="imageUrl" defaultValue={post.coverImage} required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sage focus:border-sage outline-none transition-all" placeholder="https://example.com/image.jpg" />
        </div>

        <div>
          <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">Excerpt (Short Summary)</label>
          <textarea name="excerpt" id="excerpt" defaultValue={post.excerpt} rows={2} required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sage focus:border-sage outline-none transition-all"></textarea>
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">Content (Markdown)</label>
          <textarea name="content" id="content" defaultValue={post.content} rows={12} required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sage focus:border-sage outline-none transition-all font-mono text-sm"></textarea>
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
