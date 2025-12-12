export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content_html: string;
  tags: string[];
  hero_image_url: string | null;
  related_tools: string[] | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}
