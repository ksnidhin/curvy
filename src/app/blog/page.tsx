import { blogRepository } from "@/lib/repositories/blog.repository";
import { BlogCard } from "@/components/blog/BlogCard";

export const metadata = {
  title: 'Journal | Curvy Girls',
  description: 'Style guides, tips, and inspiration for curvy women.',
};

export default async function BlogIndexPage() {
  const posts = await blogRepository.getAll();

  return (
    <div className="container mx-auto px-4 py-8 md:py-16 max-w-4xl">
      <div className="mb-12 md:mb-16 text-center">
        <h1 className="font-heading text-4xl md:text-5xl text-foreground mb-4">
          The Journal
        </h1>
        <p className="text-muted text-lg max-w-xl mx-auto">
          Honest reviews, styling tips, and curated guides for real bodies.
        </p>
      </div>

      <div className="flex flex-col gap-6 md:gap-8">
        {posts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
