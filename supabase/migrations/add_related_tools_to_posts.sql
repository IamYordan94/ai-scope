-- Add related_tools column to posts table
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS related_tools TEXT[];

-- Add comment for documentation
COMMENT ON COLUMN posts.related_tools IS 'Array of tool names that are related to this blog post';

