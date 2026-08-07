import { HeroSection } from "@/components/home/HeroSection";
import { CategoryBrowse } from "@/components/home/CategoryBrowse";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { BlogPreview } from "@/components/home/BlogPreview";
import { NewsletterBlock } from "@/components/home/NewsletterBlock";
import { settingsRepository } from "@/lib/repositories/settings.repository";

export default async function Home() {
  const settings = await settingsRepository.getSiteSettings();
  const heroImages = settings.heroImages && settings.heroImages.length > 0 
    ? settings.heroImages 
    : ["/images/products/floral-dress-1.jpg"];

  return (
    <>
      <HeroSection heroImages={heroImages} />
      <CategoryBrowse />
      <FeaturedProducts />
      <BlogPreview />
      <NewsletterBlock />
    </>
  );
}
