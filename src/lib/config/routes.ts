export const ROUTES = {
  home: '/',
  categories: '/categories',
  category: (slug: string) => `/categories/${slug}`,
  product: (slug: string) => `/products/${slug}`,
  blog: '/blog',
  blogPost: (slug: string) => `/blog/${slug}`,
  about: '/about',
  contact: '/contact',
  search: '/search',
  affiliateDisclosure: '/affiliate-disclosure',
  affiliateRedirect: (slug: string) => `/go/${slug}`,
} as const;
