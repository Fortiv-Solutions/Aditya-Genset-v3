-- =====================================================
-- ADITYA GENSET - SUPABASE SCHEMA
-- Simplified schema matching the migration structure
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. PRODUCTS TABLE
-- =====================================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  model VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  kva DECIMAL(10,2) NOT NULL,
  engine_brand VARCHAR(50) NOT NULL,
  type VARCHAR(20) NOT NULL,
  cpcb VARCHAR(20),
  status VARCHAR(50) NOT NULL DEFAULT 'published',
  price_on_request BOOLEAN DEFAULT true,
  moq INTEGER DEFAULT 1,
  lead_time_days INTEGER,
  stock VARCHAR(50),
  short_desc TEXT,
  full_desc TEXT,
  tags TEXT[],
  seo_title VARCHAR(255),
  meta_desc TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_engine_brand ON products(engine_brand);

-- =====================================================
-- 2. PRODUCT MEDIA TABLE
-- =====================================================
CREATE TABLE product_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  kind VARCHAR(50) NOT NULL,
  public_url TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_product_media_product_id ON product_media(product_id);

-- =====================================================
-- 3. PRODUCT SPECS TABLE
-- =====================================================
CREATE TABLE product_specs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  spec_label VARCHAR(255) NOT NULL,
  spec_value TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_product_specs_product_id ON product_specs(product_id);

-- =====================================================
-- 4. CMS SECTIONS TABLE (Stores showcase & presentation data)
-- =====================================================
CREATE TABLE cms_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_key VARCHAR(255) NOT NULL,
  scope_type VARCHAR(50) NOT NULL,
  scope_id UUID,
  content JSONB NOT NULL,
  revision INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_cms_sections_scope ON cms_sections(scope_type, scope_id);
CREATE INDEX idx_cms_sections_key ON cms_sections(section_key);

-- =====================================================
-- 5. PRODUCT CATEGORIES TABLE
-- =====================================================
CREATE TABLE product_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  parent_id UUID REFERENCES product_categories(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_product_categories_parent ON product_categories(parent_id);

-- =====================================================
-- 6. LEADS TABLE
-- =====================================================
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  company VARCHAR(255),
  message TEXT,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'new',
  source VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created_at ON leads(created_at);

-- =====================================================
-- 7. QUOTES TABLE
-- =====================================================
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2),
  total_price DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'draft',
  valid_until DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_quotes_lead_id ON quotes(lead_id);
CREATE INDEX idx_quotes_status ON quotes(status);

-- =====================================================
-- 8. PRESENTATION SESSIONS TABLE
-- =====================================================
CREATE TABLE presentation_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_email VARCHAR(255),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  hotspots_viewed TEXT[]
);

CREATE INDEX idx_presentation_sessions_product_id ON presentation_sessions(product_id);

-- =====================================================
-- TRIGGERS
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cms_sections_updated_at
  BEFORE UPDATE ON cms_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at
  BEFORE UPDATE ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Public read policies (anyone can view)
CREATE POLICY "Anyone can view published products"
  ON products FOR SELECT
  USING (status = 'published');

CREATE POLICY "Anyone can view product media"
  ON product_media FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view product specs"
  ON product_specs FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view CMS sections"
  ON cms_sections FOR SELECT
  USING (true);

-- Write policies (authenticated users only)
CREATE POLICY "Authenticated users can insert products"
  ON products FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update products"
  ON products FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert product media"
  ON product_media FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert product specs"
  ON product_specs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert CMS sections"
  ON cms_sections FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update CMS sections"
  ON cms_sections FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Lead policies
CREATE POLICY "Anyone can insert leads"
  ON leads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view leads"
  ON leads FOR SELECT
  USING (auth.role() = 'authenticated');

-- =====================================================
-- SAMPLE QUERY TO FETCH PRODUCT WITH ALL DATA
-- =====================================================

-- Get complete product data:
-- SELECT 
--   p.*,
--   json_agg(DISTINCT pm.*) as media,
--   json_agg(DISTINCT ps.*) as specs,
--   (SELECT content FROM cms_sections WHERE section_key = 'showcaseData' AND scope_id = p.id) as showcase,
--   (SELECT content FROM cms_sections WHERE section_key = 'presentationData' AND scope_id = p.id) as presentation
-- FROM products p
-- LEFT JOIN product_media pm ON pm.product_id = p.id
-- LEFT JOIN product_specs ps ON ps.product_id = p.id
-- WHERE p.slug = 'ekl-15-2cyl'
-- GROUP BY p.id;
