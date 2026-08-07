export interface NavLink {
  label: string;
  href: string;
}

export interface FooterSection {
  title: string;
  links: NavLink[];
}

export interface SiteSettings {
  siteName: string;
  siteDescription?: string;
  contactEmail?: string;
  announcementText?: string;
  affiliateDisclosureText?: string;
  navigation?: NavLink[];
  footerLinks?: FooterSection[];
  socialLinks?: NavLink[];
  heroImages?: string[];
}
