import { HeroSection } from "@/components/home/HeroSection";
import { CategoryBrowse } from "@/components/home/CategoryBrowse";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { BlogPreview } from "@/components/home/BlogPreview";
import { NewsletterBlock } from "@/components/home/NewsletterBlock";

export default function Home() {
  return (
    <>
      <HeroSection />
      <CategoryBrowse />
      <FeaturedProducts />
      <BlogPreview />
      <NewsletterBlock />
    </>
  );
}
