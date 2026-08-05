import { settingsRepository } from "@/lib/repositories/settings.repository";
import { HeaderClient } from "./HeaderClient";
import { CONSTANTS } from "@/lib/config/constants";

export async function Header() {
  const settings = await settingsRepository.getSiteSettings();
  
  // Parse navigation if it's stored as JSON
  const parsedNav = Array.isArray(settings?.navigation) 
    ? settings.navigation 
    : (settings?.navigation as any)?.navigation || [];

  const navLinks = parsedNav.length > 0 ? parsedNav : [
    { label: "Shop", href: "/categories" },
    { label: "New Arrivals", href: "/search?sort=newest" },
    { label: "Blog", href: "/blog" },
  ];

  return <HeaderClient navLinks={navLinks} siteName={settings?.siteName || CONSTANTS.SITE_NAME} />;
}
