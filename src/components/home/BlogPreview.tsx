import { blogRepository } from "@/lib/repositories/blog.repository";
import { BlogCard } from "../blog/BlogCard";
import { SectionHeader } from "../ui/SectionHeader";
import { ROUTES } from "@/lib/config/routes";

export async function BlogPreview() {
  const posts = await blogRepository.getLatest(2);

  if (posts.length === 0) return null;

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <SectionHeader 
          title="From the journal" 
          viewAllLink={ROUTES.blog}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
