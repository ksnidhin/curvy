import { categoryRepository } from "@/lib/repositories/category.repository";
import { CategoryTile } from "@/components/category/CategoryTile";

export const metadata = {
  title: 'Categories | Curvy Girls',
  description: 'Browse all fashion categories for curvy women.',
};

export default async function CategoriesPage() {
  const categories = await categoryRepository.getAll();

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-3xl">
      <div className="bg-[#F6EFEA] rounded-[var(--radius-card)] p-8 md:p-12 mb-10 text-center border border-border">
        <h1 className="font-heading text-3xl md:text-4xl text-foreground italic">
          Find styles that<br />match your mood<br />and moment.
        </h1>
      </div>

      <div className="flex flex-col gap-4">
        {categories.map((category) => (
          <CategoryTile key={category.id} category={category} variant="list" />
        ))}
      </div>
      
      <div className="mt-16 bg-accent/50 rounded-[var(--radius-card)] p-8 text-center">
        <div className="flex justify-center mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-rose">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </div>
        <p className="text-foreground font-medium text-sm max-w-[200px] mx-auto">
          Every pick is chosen with care, for real bodies and real women.
        </p>
      </div>
    </div>
  );
}
