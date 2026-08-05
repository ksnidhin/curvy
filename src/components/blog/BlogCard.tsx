import Image from "next/image";
import Link from "next/link";
import { BlogPost } from "@/lib/types/blog";
import { ROUTES } from "@/lib/config/routes";

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  // Format date
  const date = new Date(post.date);
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <Link href={ROUTES.blogPost(post.slug)} className="group flex items-start gap-4 p-4 rounded-[var(--radius-card)] hover:bg-accent/30 transition-colors">
      <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded-[var(--radius-button)] overflow-hidden bg-accent">
        <Image 
          src={post.image.url}
          alt={post.image.alt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 96px, 128px"
        />
      </div>
      
      <div className="flex flex-col justify-center min-h-[6rem] sm:min-h-[8rem]">
        <h3 className="font-heading text-base sm:text-lg text-foreground line-clamp-2 leading-snug mb-2 group-hover:text-sage transition-colors">
          {post.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted mt-auto">
          <span>{formattedDate}</span>
          <span className="w-1 h-1 rounded-full bg-muted/50" />
          <span>{post.readTime}</span>
        </div>
      </div>
    </Link>
  );
}
