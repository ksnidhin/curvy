import Link from "next/link";
import { CONSTANTS } from "@/lib/config/constants";
import { settingsRepository } from "@/lib/repositories/settings.repository";

export async function Footer() {
  const settings = await settingsRepository.getSiteSettings();

  if (!settings || !settings.socialLinks) return <footer className="bg-accent h-64 mt-20" />;

  // Parse socialLinks if it's stored as JSON
  const socialLinks = Array.isArray(settings.socialLinks) 
    ? settings.socialLinks 
    : (settings.socialLinks as any)?.socialLinks || [];
    
  // Parse footerLinks if it's stored as JSON
  const parsedFooterLinks = Array.isArray(settings.footerLinks)
    ? settings.footerLinks
    : (settings.footerLinks as any)?.footerLinks || [];

  const footerLinks = parsedFooterLinks.length > 0 ? parsedFooterLinks : [
    {
      title: "Shop",
      links: [
        { label: "All Categories", href: "/categories" },
        { label: "New Arrivals", href: "/search?sort=newest" },
      ]
    },
    {
      title: "About",
      links: [
        { label: "Our Story", href: "/about" },
        { label: "Contact", href: "/contact" },
      ]
    }
  ];

  return (
    <footer className="bg-accent mt-20 border-t border-border pt-16 pb-24 md:pb-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          
          <div className="col-span-1 md:col-span-1 flex flex-col items-center md:items-start text-center md:text-left">
            <Link href="/" className="flex flex-col leading-none mb-4">
              <span className="font-heading text-3xl tracking-tight text-foreground">{settings.siteName || CONSTANTS.SITE_NAME}</span>
            </Link>
            <p className="text-muted text-sm max-w-xs mb-6">
              {settings.siteDescription}
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social: any) => (
                <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-sage transition-colors text-sm">
                  {social.label}
                </a>
              ))}
            </div>
          </div>

          <div className="col-span-1 md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8">
            {footerLinks.map((section) => (
              <div key={section.title}>
                <h3 className="font-heading text-lg mb-4 text-foreground">{section.title}</h3>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-sm text-muted hover:text-sage transition-colors">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>
        
        <div className="mt-16 pt-8 border-t border-border/50 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted">
          <p>&copy; {new Date().getFullYear()} {settings.siteName || CONSTANTS.SITE_NAME}. All rights reserved.</p>
          <p className="max-w-xl text-center md:text-right">{settings.affiliateDisclosureText || "2026 Curvy Girls. As an affiliate partner, we may earn commission from qualifying purchases at no extra cost to you."}</p>
        </div>
      </div>
    </footer>
  );
}
