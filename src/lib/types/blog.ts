import { Image } from "./common";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string; // ISO 8601 string
  readTime: string; // e.g., "5 min read"
  image: Image;
}
