import { categoryRepository } from "@/lib/repositories/category.repository";
import { CategoryTile } from "../category/CategoryTile";
import { SectionHeader } from "../ui/SectionHeader";
import { ROUTES } from "@/lib/config/routes";

export async function CategoryBrowse() {
  const categories = await categoryRepository.getAll();

  if (categories.length === 0) return null;

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <SectionHeader 
          title="Browse by category" 
          viewAllLink={ROUTES.categories}
        />
        
        {/* Horizontal scroll on mobile, grid on desktop */}
        <div className="flex overflow-x-auto pb-6 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-4 lg:grid-cols-8 gap-4 md:gap-6 hide-scrollbar">
          {categories.map((category) => (
            <div key={category.id} className="flex-shrink-0 w-[100px] sm:w-[120px] md:w-auto">
              <CategoryTile category={category} variant="grid" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
