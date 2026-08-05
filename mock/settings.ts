import { SiteSettings } from "../src/lib/types/settings";

export const settings: SiteSettings = {
  siteName: "Curvy Girls",
  announcementText: "Honest picks. No sales. We earn commission.",
  affiliateDisclosureText: "As an affiliate, we may earn a commission from qualifying purchases at no extra cost to you.",
  navigation: [
    { label: "Home", href: "/" },
    { label: "Categories", href: "/categories" },
    { label: "Blog", href: "/blog" },
  ],
  footerLinks: [
    {
      title: "Shop",
      links: [
        { label: "Categories", href: "/categories" },
        { label: "Dresses", href: "/categories/dresses" },
        { label: "Kurtis & Tunics", href: "/categories/kurtis-tunics" },
      ],
    },
    {
      title: "About",
      links: [
        { label: "Our Story", href: "/about" },
        { label: "Journal", href: "/blog" },
        { label: "Contact Us", href: "/contact" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Affiliate Disclosure", href: "/affiliate-disclosure" },
      ],
    },
  ],
  socialLinks: [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "Pinterest", href: "https://pinterest.com" },
  ],
};
