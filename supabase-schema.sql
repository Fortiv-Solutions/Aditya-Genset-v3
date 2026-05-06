-- =====================================================
-- ADITYA GENSET V2 - DATABASE SCHEMA
-- Product Catalogue Management System
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. PRODUCTS TABLE (Main product catalog)
-- =====================================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  model VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  kva DECIMAL(10,2) NOT NULL,
  engine_brand VARCHAR(50) NOT NULL CHECK (engine_brand IN ('Baudouin', 'Escorts', 'Kubota')),
  type VARCHAR(20) NOT NULL CHECK (type IN ('Silent', 'Open')),
  phase VARCHAR(20) NOT NULL CHECK (phase IN ('Single', 'Three')),
  application VARCHAR(50) NOT NULL CHECK (application IN ('Prime', 'Standby', 'Continuous')),
  status VARCHAR(50) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Discontinued', 'Coming Soon')),
  tags TEXT[] DEFAULT '{}',
  thumbnail_url TEXT,
  hero_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_engine_brand ON products(engine_brand);
CREATE INDEX idx_products_kva ON products(kva);
CREATE INDEX idx_products_tags ON products USING GIN(tags);

-- =====================================================
-- 2. PRODUCT SPECS TABLE (Technical specifications)
-- =====================================================
CREATE TABLE product_specs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  spec_key VARCHAR(255) NOT NULL,
  spec_value TEXT NOT NULL,
  "order" INTEGER DEFAULT 0
);

CREATE INDEX idx_product_specs_product_id ON product_specs(product_id);

-- =====================================================
-- 3. PRODUCT IMAGES TABLE (Multiple images per product)
-- =====================================================
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_type VARCHAR(50) NOT NULL CHECK (image_type IN ('main', 'gallery', 'detail', 'section')),
  alt_text TEXT,
  "order" INTEGER DEFAULT 0
);

CREATE INDEX idx_product_images_product_id ON product_images(product_id);

-- =====================================================
-- 4. SHOWCASE SECTIONS TABLE (Detailed product pages)
-- =====================================================
CREATE TABLE showcase_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  section_id VARCHAR(100) NOT NULL,
  section_number VARCHAR(10) NOT NULL,
  title VARCHAR(255) NOT NULL,
  tagline TEXT,
  description TEXT,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  "order" INTEGER DEFAULT 0
);

CREATE INDEX idx_showcase_sections_product_id ON showcase_sections(product_id);

-- =====================================================
-- 5. SHOWCASE SECTION SPECS TABLE
-- =====================================================
CREATE TABLE showcase_section_specs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID NOT NULL REFERENCES showcase_sections(id) ON DELETE CASCADE,
  label VARCHAR(255) NOT NULL,
  value TEXT NOT NULL,
  "order" INTEGER DEFAULT 0
);

CREATE INDEX idx_showcase_section_specs_section_id ON showcase_section_specs(section_id);

-- =====================================================
-- 6. SHOWCASE SECTION HIGHLIGHTS TABLE
-- =====================================================
CREATE TABLE showcase_section_highlights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID NOT NULL REFERENCES showcase_sections(id) ON DELETE CASCADE,
  value DECIMAL(10,2) NOT NULL,
  suffix VARCHAR(50),
  label VARCHAR(255) NOT NULL,
  "order" INTEGER DEFAULT 0
);

CREATE INDEX idx_showcase_section_highlights_section_id ON showcase_section_highlights(section_id);

-- =====================================================
-- 7. PRESENTATION HOTSPOTS TABLE (Guided presentation)
-- =====================================================
CREATE TABLE presentation_hotspots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  hotspot_id VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  x_position DECIMAL(5,2) NOT NULL,
  y_position DECIMAL(5,2) NOT NULL,
  zoom DECIMAL(5,2) DEFAULT 1.0,
  offset_x DECIMAL(5,2) DEFAULT 0,
  offset_y DECIMAL(5,2) DEFAULT 0,
  sub_image_url TEXT,
  "order" INTEGER DEFAULT 0
);

CREATE INDEX idx_presentation_hotspots_product_id ON presentation_hotspots(product_id);

-- =====================================================
-- 8. PRESENTATION HOTSPOT SPECS TABLE
-- =====================================================
CREATE TABLE presentation_hotspot_specs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotspot_id UUID NOT NULL REFERENCES presentation_hotspots(id) ON DELETE CASCADE,
  label VARCHAR(255) NOT NULL,
  value TEXT NOT NULL,
  "order" INTEGER DEFAULT 0
);

CREATE INDEX idx_presentation_hotspot_specs_hotspot_id ON presentation_hotspot_specs(hotspot_id);

-- =====================================================
-- 9. PRODUCT VERSION HISTORY TABLE (Audit trail)
-- =====================================================
CREATE TABLE product_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  changed_by VARCHAR(255),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  field_name VARCHAR(255) NOT NULL,
  old_value TEXT,
  new_value TEXT
);

CREATE INDEX idx_product_versions_product_id ON product_versions(product_id);
CREATE INDEX idx_product_versions_changed_at ON product_versions(changed_at);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add inquiry count to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS inquiry_count INTEGER DEFAULT 0;

-- Function to increment inquiry count
CREATE OR REPLACE FUNCTION increment_product_inquiries(product_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE products
  SET inquiry_count = inquiry_count + 1,
      updated_at = NOW()
  WHERE id = product_id;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 10. CMS SECTIONS TABLE (Dynamic Content Store)
-- =====================================================
CREATE TABLE cms_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_key VARCHAR(100) NOT NULL,
  scope_type VARCHAR(20) NOT NULL DEFAULT 'global' CHECK (scope_type IN ('global', 'product', 'category', 'page')),
  scope_id UUID, -- References products.id, pages.id etc.
  content JSONB NOT NULL DEFAULT '{}',
  revision INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(section_key, scope_type, scope_id)
);

CREATE INDEX idx_cms_sections_key ON cms_sections(section_key);
CREATE INDEX idx_cms_sections_scope ON cms_sections(scope_type, scope_id);

-- Enable RLS
ALTER TABLE cms_sections ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "CMS sections are viewable by everyone"
  ON cms_sections FOR SELECT
  USING (true);

-- Admin write access
CREATE POLICY "Authenticated users can manage CMS sections"
  ON cms_sections FOR ALL
  USING (auth.role() = 'authenticated');

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE showcase_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE showcase_section_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE showcase_section_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE presentation_hotspots ENABLE ROW LEVEL SECURITY;
ALTER TABLE presentation_hotspot_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_versions ENABLE ROW LEVEL SECURITY;

-- Public read access (anyone can view products)
CREATE POLICY "Public products are viewable by everyone"
  ON products FOR SELECT
  USING (status = 'Active');

CREATE POLICY "All product specs are viewable"
  ON product_specs FOR SELECT
  USING (true);

CREATE POLICY "All product images are viewable"
  ON product_images FOR SELECT
  USING (true);

CREATE POLICY "All showcase sections are viewable"
  ON showcase_sections FOR SELECT
  USING (true);

CREATE POLICY "All showcase section specs are viewable"
  ON showcase_section_specs FOR SELECT
  USING (true);

CREATE POLICY "All showcase section highlights are viewable"
  ON showcase_section_highlights FOR SELECT
  USING (true);

CREATE POLICY "All presentation hotspots are viewable"
  ON presentation_hotspots FOR SELECT
  USING (true);

CREATE POLICY "All presentation hotspot specs are viewable"
  ON presentation_hotspot_specs FOR SELECT
  USING (true);

-- Admin write access (authenticated users can modify)
-- Note: You'll need to set up authentication and admin roles
CREATE POLICY "Authenticated users can insert products"
  ON products FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update products"
  ON products FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete products"
  ON products FOR DELETE
  USING (auth.role() = 'authenticated');

-- =====================================================
-- SAMPLE DATA INSERT (Optional - for testing)
-- =====================================================

-- Insert sample product
INSERT INTO products (slug, model, name, kva, engine_brand, type, phase, application, status, tags, thumbnail_url, hero_image_url)
VALUES (
  'silent-62-5',
  'ADG-62.5S',
  '62.5 kVA Silent DG Set',
  62.5,
  'Baudouin',
  'Silent',
  'Three',
  'Prime',
  'Active',
  ARRAY['Best Seller', 'Featured'],
  '/assets/brand/dg-real-1.png',
  '/assets/brand/dg-real-1.png'
);

-- Get the product ID for reference
DO $$
DECLARE
  product_uuid UUID;
BEGIN
  SELECT id INTO product_uuid FROM products WHERE slug = 'silent-62-5';
  
  -- Insert showcase sections
  INSERT INTO showcase_sections (product_id, section_id, section_number, title, tagline, image_url, alt_text, "order")
  VALUES 
    (product_uuid, 'overview', '01', '62.5 kVA Silent DG Set', 'Industrial-grade reliability, whisper-quiet by design.', '/assets/brand/dg-real-1.png', '62.5 kVA silent diesel generator overview', 1),
    (product_uuid, 'engine', '02', 'Engine', 'Built for continuous duty and tight load response.', '/assets/brand/engine-baudouin.jpg', 'Turbocharged 4-cylinder diesel engine', 2),
    (product_uuid, 'power', '03', 'Power Output', 'Clean, stable 3-phase power for sensitive loads.', '/assets/dg-alternator.jpg', 'Industrial brushless alternator', 3),
    (product_uuid, 'sound', '04', 'Sound & Enclosure', 'CPCB IV+ compliant. Engineered to disappear into its environment.', '/assets/brand/dg-product.jpg', 'Acoustic enclosure', 4),
    (product_uuid, 'dimensions', '05', 'Dimensions & Weight', 'Compact footprint, easy to site and service.', '/assets/genset-hero-CdfwbH8a.jpg', 'Side profile view', 5);
END $$;

-- =====================================================
-- USEFUL QUERIES
-- =====================================================

-- Get product with all showcase sections and specs
-- SELECT p.*, 
--   json_agg(DISTINCT jsonb_build_object(
--     'id', ss.id,
--     'section_id', ss.section_id,
--     'title', ss.title,
--     'specs', (
--       SELECT json_agg(jsonb_build_object('label', sss.label, 'value', sss.value))
--       FROM showcase_section_specs sss
--       WHERE sss.section_id = ss.id
--     )
--   )) as sections
-- FROM products p
-- LEFT JOIN showcase_sections ss ON ss.product_id = p.id
-- WHERE p.slug = 'silent-62-5'
-- GROUP BY p.id;
