export interface Product {
  id: string;
  title: string;
  brand: string;
  price: number;
  image: string;
  link: string;
  mall: string;
  tags: string[];
  reason?: string;
}

export type AgeGroup = "20s" | "30s" | "40s" | "50plus";
export type BodyType = "slim" | "average" | "robust";

export interface UserProfile {
  ageGroup?: AgeGroup;
  bodyType?: BodyType;
  height?: number;
  preferredStyles: string[];
}

export interface RelatedContent {
  title: string;
  description: string;
  link: string;
  blogger: string;
  postdate: string;
}

export interface NewsContent {
  title: string;
  description: string;
  link: string;
  pubDate: string;
}

export interface VideoContent {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  channel: string;
  publishedAt: string;
  link: string;
}

export interface CurationResult {
  style_summary: string;
  keywords_used: string[];
  featured_products: Product[];
  products: Product[];
  ai_comment: string;
  related_content: RelatedContent[];
  related_news: NewsContent[];
  related_videos: VideoContent[];
}

export type AIModel = "anthropic" | "openai" | "gemini";

export interface User {
  email: string;
  isAdmin: boolean;
}

export interface WishlistItem extends Omit<Product, "reason"> {
  addedAt: string;
}
