# Supabase Setup Guide for Aditya Genset V2

This guide will help you set up Supabase for the Product Catalogue Management System.

## Prerequisites
- Node.js installed
- Git repository set up
- Supabase account (free tier is fine)

---

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click **"New Project"**
4. Fill in:
   - **Project Name**: `aditya-genset-v2`
   - **Database Password**: (create a strong password and save it)
   - **Region**: Choose closest to your users
5. Click **"Create new project"**
6. Wait 2-3 minutes for project to be ready

---

## Step 2: Get API Credentials

1. In your Supabase project dashboard, click **"Settings"** (gear icon)
2. Click **"API"** in the left sidebar
3. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

---

## Step 3: Configure Environment Variables

1. Create a `.env` file in your project root:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and add your credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. **IMPORTANT**: Add `.env` to `.gitignore` (should already be there)

---

## Step 4: Create Database Tables

1. In Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Copy the entire contents of `supabase-schema.sql` file
4. Paste into the SQL editor
5. Click **"Run"** (or press Ctrl+Enter)
6. You should see: **"Success. No rows returned"**

This creates all tables:
- ✅ products
- ✅ product_specs
- ✅ product_images
- ✅ showcase_sections
- ✅ showcase_section_specs
- ✅ showcase_section_highlights
- ✅ presentation_hotspots
- ✅ presentation_hotspot_specs
- ✅ product_versions

---

## Step 5: Verify Tables Created

1. Click **"Table Editor"** in the left sidebar
2. You should see all 9 tables listed
3. Click on **"products"** table - it should be empty (for now)

---

## Step 6: Set Up Storage (for images)

1. Click **"Storage"** in the left sidebar
2. Click **"Create a new bucket"**
3. Name it: `product-images`
4. Make it **Public** (so images can be accessed)
5. Click **"Create bucket"**

---

## Step 7: Configure Storage Policies

1. Click on the `product-images` bucket
2. Click **"Policies"** tab
3. Click **"New Policy"**
4. Select **"For full customization"**
5. Add this policy:

```sql
-- Allow public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);
```

---

## Step 8: Migrate Existing Data (Optional)

If you want to migrate your current hardcoded product data to Supabase:

1. Open your browser console (F12)
2. Go to your app: `http://localhost:5173`
3. In the console, run:
   ```javascript
   import { migrateProductToSupabase } from './src/lib/migrateToSupabase'
   await migrateProductToSupabase()
   ```

Or create a temporary migration page:

```typescript
// src/pages/Migrate.tsx
import { migrateProductToSupabase } from '@/lib/migrateToSupabase'

export default function Migrate() {
  const handleMigrate = async () => {
    await migrateProductToSupabase()
    alert('Migration complete!')
  }

  return (
    <div className="p-8">
      <h1>Database Migration</h1>
      <button onClick={handleMigrate} className="px-4 py-2 bg-blue-500 text-white rounded">
        Migrate Data to Supabase
      </button>
    </div>
  )
}
```

---

## Step 9: Test the Connection

Create a test file to verify everything works:

```typescript
// src/test/supabaseTest.ts
import { supabase } from '@/lib/supabase'

export async function testSupabaseConnection() {
  // Test 1: Fetch products
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .limit(5)

  if (error) {
    console.error('❌ Connection failed:', error)
    return false
  }

  console.log('✅ Connection successful!')
  console.log('Products found:', products?.length || 0)
  return true
}
```

---

## Step 10: Update Your Components

Now you can update your components to fetch from Supabase instead of hardcoded data:

### Before (Hardcoded):
```typescript
import { SHOWCASE } from '@/data/products'

export default function ProductDetail() {
  const product = SHOWCASE
  // ...
}
```

### After (Database):
```typescript
import { useEffect, useState } from 'react'
import { fetchProductFromSupabase } from '@/lib/migrateToSupabase'

export default function ProductDetail() {
  const [product, setProduct] = useState(null)
  
  useEffect(() => {
    async function loadProduct() {
      const data = await fetchProductFromSupabase('silent-62-5')
      setProduct(data)
    }
    loadProduct()
  }, [])
  
  if (!product) return <div>Loading...</div>
  // ...
}
```

---

## Troubleshooting

### Error: "relation does not exist"
- Make sure you ran the SQL schema file completely
- Check Table Editor to verify tables were created

### Error: "Invalid API key"
- Double-check your `.env` file has correct credentials
- Make sure you copied the **anon public** key, not the service role key
- Restart your dev server after changing `.env`

### Error: "Row Level Security policy violation"
- Check your RLS policies in Supabase dashboard
- For testing, you can temporarily disable RLS on tables

### Images not loading
- Make sure storage bucket is set to **Public**
- Check storage policies allow public read access
- Verify image URLs are correct

---

## Next Steps

1. ✅ Set up Supabase project
2. ✅ Create database tables
3. ✅ Configure environment variables
4. ✅ Set up storage for images
5. ⏭️ Build Admin Dashboard (next phase)
6. ⏭️ Migrate all products to database
7. ⏭️ Update all components to use Supabase

---

## Useful Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)

---

## Support

If you encounter any issues:
1. Check Supabase logs in dashboard
2. Check browser console for errors
3. Verify environment variables are loaded
4. Test connection with the test function

Need help? Contact your development team or check Supabase Discord community.
