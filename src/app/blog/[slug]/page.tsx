import { blogRepository } from "@/lib/repositories/blog.repository";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "@/lib/config/routes";
import { ChevronLeft } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await blogRepository.getBySlug(slug);
  if (!post) return { title: 'Not Found' };
  return {
    title: `${post.title} | Curvy Girls`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await blogRepository.getBySlug(slug);
  
  if (!post) {
    notFound();
  }

  const date = new Date(post.date);
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <article className="container mx-auto px-4 py-8 md:py-12 max-w-3xl">
      <Link 
        href={ROUTES.blog} 
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-sage mb-8 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Journal
      </Link>

      <header className="mb-10 text-center">
        <h1 className="font-heading text-3xl md:text-5xl text-foreground mb-6 leading-tight">
          {post.title}
        </h1>
        
        <div className="flex items-center justify-center gap-3 text-sm text-muted">
          <span>{formattedDate}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-sage/50"></span>
          <span>{post.readTime}</span>
        </div>
      </header>

      <div className="relative aspect-video w-full rounded-[var(--radius-card)] overflow-hidden mb-12 bg-accent">
        <Image
          src={post.image.url}
          alt={post.image.alt}
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="prose prose-lg prose-headings:font-heading prose-headings:text-foreground prose-p:text-muted prose-a:text-sage hover:prose-a:text-rose max-w-none">
        {/* We use a simple paragraph here since our mock content is simple text. 
            In a real app, this would use a Markdown renderer or MDX. */}
        <p className="text-lg leading-relaxed md:text-xl md:leading-loose text-foreground mb-8 font-medium">
          {post.excerpt}
        </p>
        
        {post.content.split('\n\n').map((paragraph, index) => (
          <p key={index} className="leading-relaxed mb-6">
            {paragraph}
          </p>
        ))}
      </div>
      
      <div className="mt-16 pt-8 border-t border-border flex justify-between items-center">
        <p className="text-muted text-sm italic">Thanks for reading.</p>
        <div className="flex gap-4">
          <button className="text-muted hover:text-sage text-sm font-medium transition-colors">Share article</button>
        </div>
      </div>
    </article>
  );
}
