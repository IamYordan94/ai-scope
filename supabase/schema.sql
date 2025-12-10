-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create tools table
CREATE TABLE IF NOT EXISTS tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  category VARCHAR(100),
  website_url VARCHAR(500),
  logo_url VARCHAR(500),
  pricing_free BOOLEAN DEFAULT false,
  pricing_tier VARCHAR(50), -- free, freemium, paid, enterprise
  pricing_details JSONB, -- {monthly: "$10", annual: "$100", free_tier: "Limited"}
  features TEXT[], -- array of features
  use_cases TEXT[], -- array of use cases
  tags TEXT[], -- array of tags
  popularity_score INTEGER DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tools_category ON tools(category);
CREATE INDEX IF NOT EXISTS idx_tools_slug ON tools(slug);
CREATE INDEX IF NOT EXISTS idx_tools_popularity ON tools(popularity_score DESC);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- Enable Row Level Security (RLS)
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public read access for tools" ON tools
  FOR SELECT USING (true);

CREATE POLICY "Public read access for categories" ON categories
  FOR SELECT USING (true);

-- Insert initial categories
INSERT INTO categories (name, slug, description) VALUES
  ('Text AI', 'text-ai', 'AI tools for text generation, writing, and language processing'),
  ('Image AI', 'image-ai', 'AI tools for image generation, editing, and manipulation'),
  ('Video AI', 'video-ai', 'AI tools for video generation, editing, and processing'),
  ('Code AI', 'code-ai', 'AI tools for code generation, completion, and assistance'),
  ('Audio AI', 'audio-ai', 'AI tools for audio generation, editing, and processing'),
  ('Productivity AI', 'productivity-ai', 'AI tools for productivity, automation, and workflow')
ON CONFLICT (name) DO NOTHING;

-- Create posts table for blog
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt TEXT,
  content_html TEXT NOT NULL,
  tags TEXT[], -- array of tags
  hero_image_url VARCHAR(500),
  published_at TIMESTAMP, -- nullable for drafts
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_tags ON posts USING GIN(tags);

-- Enable Row Level Security (RLS)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (only published posts)
CREATE POLICY "Public read access for published posts" ON posts
  FOR SELECT USING (published_at IS NOT NULL AND published_at <= NOW());
