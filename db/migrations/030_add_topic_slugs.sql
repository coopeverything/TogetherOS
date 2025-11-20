-- Migration: Add Topic Slugs for User-Friendly URLs
-- Date: 2025-11-20
-- Description: Adds slug field to topics table and generates slugs from titles

-- Add slug column to topics table
ALTER TABLE topics ADD COLUMN slug VARCHAR(250);

-- Create function to generate slug from title
CREATE OR REPLACE FUNCTION generate_topic_slug(topic_title TEXT, topic_id UUID)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Convert title to slug format:
  -- 1. Lowercase
  -- 2. Replace spaces and underscores with hyphens
  -- 3. Remove non-alphanumeric characters except hyphens
  -- 4. Remove consecutive hyphens
  -- 5. Trim hyphens from start/end
  base_slug := regexp_replace(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          lower(topic_title),
          '[_\s]+', '-', 'g'
        ),
        '[^a-z0-9\-]', '', 'g'
      ),
      '-+', '-', 'g'
    ),
    '^-+|-+$', '', 'g'
  );

  -- Limit slug length to 200 characters
  base_slug := substring(base_slug from 1 for 200);

  -- Ensure uniqueness by appending counter if needed
  final_slug := base_slug;
  WHILE EXISTS (
    SELECT 1 FROM topics
    WHERE slug = final_slug
    AND id != topic_id
  ) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;

  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Populate slugs for existing topics
UPDATE topics
SET slug = generate_topic_slug(title, id)
WHERE slug IS NULL;

-- Make slug column NOT NULL now that all rows have values
ALTER TABLE topics ALTER COLUMN slug SET NOT NULL;

-- Create unique index on slug for fast lookups
CREATE UNIQUE INDEX idx_topics_slug ON topics(slug) WHERE deleted_at IS NULL;

-- Create trigger to auto-generate slug on insert/update
CREATE OR REPLACE FUNCTION auto_generate_topic_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate slug if not provided or title changed
  IF NEW.slug IS NULL OR (TG_OP = 'UPDATE' AND OLD.title != NEW.title) THEN
    NEW.slug := generate_topic_slug(NEW.title, NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_generate_topic_slug_trigger
  BEFORE INSERT OR UPDATE ON topics
  FOR EACH ROW EXECUTE FUNCTION auto_generate_topic_slug();

-- Grant permissions
GRANT EXECUTE ON FUNCTION generate_topic_slug(TEXT, UUID) TO togetheros_app;

-- Comments for documentation
COMMENT ON COLUMN topics.slug IS 'URL-friendly identifier generated from title (unique, auto-generated)';
COMMENT ON FUNCTION generate_topic_slug IS 'Generates unique slug from topic title for SEO-friendly URLs';
