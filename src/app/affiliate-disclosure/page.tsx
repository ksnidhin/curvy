import { settingsRepository } from "@/lib/repositories/settings.repository";

export const metadata = {
  title: 'Affiliate Disclosure | Curvy Girls',
  description: 'How we make money and our commitment to honest recommendations.',
};

export default async function AffiliateDisclosurePage() {
  const settings = await settingsRepository.getSiteSettings();

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 max-w-3xl">
      <h1 className="font-heading text-3xl md:text-4xl text-foreground mb-8">Affiliate Disclosure</h1>

      <div className="prose prose-lg prose-headings:font-heading prose-headings:text-foreground prose-p:text-muted max-w-none">
        <p className="text-lg text-foreground font-medium mb-8">
          {settings?.affiliateDisclosureText || "As an Amazon Associate I earn from qualifying purchases."}
        </p>

        <p className="mb-6">
          Curvy Girls is a curated fashion recommendation platform. We spend significant time researching, reviewing, and selecting the best fashion pieces for curvy women from various trusted online retailers.
        </p>

        <h2 className="text-2xl mt-10 mb-4">How it works</h2>
        <p className="mb-6">
          When you click on a product link on our website, you are redirected to the retailer's website (such as Myntra, Ajio, Amazon, etc.). If you make a purchase during that visit, we may receive a small commission from the retailer.
        </p>

        <h2 className="text-2xl mt-10 mb-4">Does this affect what we recommend?</h2>
        <p className="mb-6">
          <strong>Absolutely not.</strong> Our primary goal is to help you find clothes that fit and flatter your body. We only recommend products that we believe are of high quality and offer good value. Our editorial integrity is paramount, and we do not accept payment from brands to feature inferior products.
        </p>

        <h2 className="text-2xl mt-10 mb-4">Will it cost you more?</h2>
        <p className="mb-6">
          No. The price you pay for the product remains exactly the same whether you use our affiliate link or go directly to the retailer's website. The commission we earn is paid by the retailer as a marketing expense.
        </p>
        
        <div className="bg-[#F9F6F0] p-6 rounded-[var(--radius-card)] mt-12 border border-border">
          <p className="text-sm text-muted m-0">
            By using our links to make your purchases, you are helping to support Curvy Girls and allowing us to continue creating free, high-quality content and recommendations. Thank you for your support!
          </p>
        </div>
      </div>
    </div>
  );
}
