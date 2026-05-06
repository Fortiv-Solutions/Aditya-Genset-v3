# Quick Start - Supabase Setup (5 Minutes)

## 🚀 Fast Track Setup

### 1. Create Supabase Account (1 min)
```
1. Go to https://supabase.com
2. Sign up with GitHub/Google
3. Create new project: "aditya-genset-v2"
4. Wait for project to initialize
```

### 2. Get Your Credentials (30 sec)
```
1. Settings → API
2. Copy "Project URL"
3. Copy "anon public" key
```

### 3. Add to Your Project (30 sec)
```bash
# Create .env file
echo "VITE_SUPABASE_URL=your-url-here" > .env
echo "VITE_SUPABASE_ANON_KEY=your-key-here" >> .env
```

### 4. Create Database Tables (2 min)
```
1. Open Supabase → SQL Editor
2. Copy entire supabase-schema.sql file
3. Paste and click "Run"
4. Done! ✅
```

### 5. Test Connection (1 min)
```bash
npm run dev
# Open browser console and run:
# import { supabase } from './src/lib/supabase'
# const { data } = await supabase.from('products').select('*')
# console.log(data)
```

## ✅ You're Done!

Your database is ready. Now you can:
- View tables in Supabase Table Editor
- Start building admin dashboard
- Migrate existing products

## 📚 Next Steps
- Read full setup guide: `SUPABASE_SETUP.md`
- Build admin dashboard
- Upload product images to storage

## 🆘 Quick Fixes

**Can't connect?**
- Restart dev server after adding .env
- Check credentials are correct
- Make sure .env is in project root

**Tables not created?**
- Run SQL schema again
- Check for error messages in SQL editor
- Verify you're in correct project

**Need help?**
- Check SUPABASE_SETUP.md for detailed guide
- Contact development team
