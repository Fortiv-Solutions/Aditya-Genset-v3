# Troubleshooting Guide

## Common Issues and Solutions

### PDF Upload Issues

#### Issue: "Please upload a valid PDF file"
**Cause**: File is not a PDF or is corrupted  
**Solution**:
- Verify file extension is `.pdf`
- Try opening PDF in Adobe Reader to confirm it's valid
- Re-export PDF from source application
- Try a different PDF

#### Issue: PDF upload hangs or takes too long
**Cause**: PDF is very large or has many pages  
**Solution**:
- System processes up to 8 pages for images
- Large PDFs (>50MB) may take longer
- Wait up to 30 seconds before retrying
- Consider splitting large PDFs

### Extraction Issues

#### Issue: "Extraction failed" error
**Cause**: AI API unavailable or PDF text unreadable  
**Solution**:
- Check if `VITE_GEMINI_API_KEY` is set in `.env`
- Verify API key is valid at https://aistudio.google.com/app/apikey
- System will automatically fall back to local parsing
- Check console for detailed error message

#### Issue: Low confidence extraction
**Cause**: PDF has poor structure or is scanned image  
**Solution**:
- Manually review and fill missing fields
- Add specifications in spec builder
- System will still generate 10 chapters
- Consider OCR for scanned PDFs

#### Issue: Many "Refer datasheet" placeholders
**Cause**: PDF doesn't have structured data  
**Solution**:
- This is normal for some PDFs
- Manually fill in specifications
- Use spec builder to add missing data
- System generates complete structure regardless

#### Issue: Wrong data extracted
**Cause**: AI misinterpreted PDF content  
**Solution**:
- Review all fields before publishing
- Edit incorrect fields manually
- Add correct specifications
- Report patterns to improve extraction

### Category Assignment Issues

#### Issue: Product assigned to wrong category
**Cause**: Engine brand not detected correctly  
**Solution**:
- Manually select correct category from dropdown
- System respects manual selection
- Check engine brand field is correct
- Update if needed

#### Issue: Category not showing in dropdown
**Cause**: Category doesn't exist in database  
**Solution**:
- System auto-creates categories on first use
- Check Supabase `product_categories` table
- Verify category slug in `productAutomation.ts`
- Contact support if issue persists

### Image Issues

#### Issue: Images not showing in showcase
**Cause**: URLs invalid or images not uploaded  
**Solution**:
- Check media URLs are valid
- Verify Supabase storage bucket is public
- Check `product_media` table has correct URLs
- Re-upload images if needed

#### Issue: PDF page images not captured
**Cause**: PDF rendering failed  
**Solution**:
- Check browser console for errors
- Try different PDF
- Manually add image URLs
- System will use fallback images

#### Issue: Broken image icons in showcase
**Cause**: Image URLs are broken or inaccessible  
**Solution**:
- Verify URLs are publicly accessible
- Check Supabase storage permissions
- Update URLs in admin panel
- System uses fallback images if available

### Showcase Page Issues

#### Issue: Only 4 chapters showing instead of 10
**Cause**: Old data or incomplete generation  
**Solution**:
- Re-publish product to regenerate
- Check `cms_sections` table for `showcaseData`
- Verify `sections` array has 10 items
- Clear browser cache and reload

#### Issue: Missing specifications in chapters
**Cause**: Specs not extracted or not saved  
**Solution**:
- Check `product_specs` table
- Re-add specifications in admin panel
- Re-publish product
- Verify specs display order

#### Issue: Showcase page not loading
**Cause**: Product not found or CMS data missing  
**Solution**:
- Verify product status is "published"
- Check product slug is correct
- Verify `cms_sections` has `showcaseData`
- Check browser console for errors

### Presentation Mode Issues

#### Issue: Hotspots not clickable
**Cause**: Presentation data missing or incorrect  
**Solution**:
- Check `cms_sections` for `presentationData`
- Verify hotspots array has 10 items
- Re-publish product to regenerate
- Check browser console for errors

#### Issue: Zoom animations not working
**Cause**: JavaScript error or missing data  
**Solution**:
- Check browser console for errors
- Verify hotspot zoom values are set
- Clear browser cache
- Try different browser

#### Issue: Sub-images not showing
**Cause**: Image URLs missing or invalid  
**Solution**:
- Check hotspot `subImage` URLs
- Verify images are accessible
- Update URLs in CMS data
- System uses main image as fallback

### Supabase Issues

#### Issue: "Unable to save product" error
**Cause**: Database connection or permission issue  
**Solution**:
- Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`
- Verify Supabase project is active
- Check RLS policies allow inserts
- Check browser console for detailed error

#### Issue: Media upload fails
**Cause**: Storage bucket not configured  
**Solution**:
- Verify `product-media` bucket exists
- Check bucket is set to public
- Verify `VITE_SUPABASE_PRODUCT_MEDIA_BUCKET` in `.env`
- Check file size limits

#### Issue: CMS data not saving
**Cause**: Permission or schema issue  
**Solution**:
- Check `cms_sections` table exists
- Verify RLS policies allow inserts/updates
- Check JSONB column accepts data
- Review Supabase logs

### Performance Issues

#### Issue: Extraction takes too long
**Cause**: Large PDF or slow API response  
**Solution**:
- Wait up to 30 seconds
- Check internet connection
- Try smaller PDF
- System will timeout and use fallback

#### Issue: Page loads slowly
**Cause**: Large images or many database queries  
**Solution**:
- Optimize images before upload
- Use WebP format for better compression
- Check Supabase query performance
- Enable browser caching

#### Issue: Admin panel is slow
**Cause**: Too many products or large data  
**Solution**:
- Use filters to reduce displayed products
- Paginate product list
- Archive old products
- Optimize database indexes

### Data Quality Issues

#### Issue: Duplicate specifications
**Cause**: Same spec added multiple times  
**Solution**:
- Review spec list before publishing
- Remove duplicates manually
- System should prevent duplicates
- Report if issue persists

#### Issue: Incorrect kVA calculation
**Cause**: kWe calculated from wrong kVA  
**Solution**:
- Verify kVA field is correct
- kWe = kVA × 0.8 (standard formula)
- Manually correct if needed
- Check power factor is 0.8

#### Issue: Missing chapter data
**Cause**: Incomplete extraction or generation  
**Solution**:
- Check all 10 chapters exist
- Verify each chapter has specs
- Re-publish to regenerate
- Add missing data manually

## Debugging Steps

### 1. Check Browser Console
```javascript
// Open browser console (F12)
// Look for errors in red
// Common errors:
// - Network errors (Supabase connection)
// - CORS errors (API configuration)
// - JavaScript errors (code issues)
```

### 2. Check Supabase Logs
```sql
-- Check recent inserts
SELECT * FROM products ORDER BY created_at DESC LIMIT 10;

-- Check CMS data
SELECT section_key, scope_type, scope_id 
FROM cms_sections 
WHERE scope_id = 'your-product-id';

-- Check media
SELECT kind, public_url 
FROM product_media 
WHERE product_id = 'your-product-id';

-- Check specs
SELECT spec_label, spec_value 
FROM product_specs 
WHERE product_id = 'your-product-id'
ORDER BY display_order;
```

### 3. Verify Environment Variables
```bash
# Check .env file has all required variables
VITE_GEMINI_API_KEY=your_key
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
VITE_SUPABASE_PRODUCT_MEDIA_BUCKET=product-media
```

### 4. Test with EKL15 Reference
```typescript
// Use EKL15 as reference to compare
// Check if EKL15 showcase works
// Compare data structure
// Verify template is correct
```

### 5. Check Network Requests
```javascript
// Open Network tab in browser console
// Look for failed requests (red)
// Check API responses
// Verify Supabase calls succeed
```

## Error Messages

### "VITE_GEMINI_API_KEY is not set"
**Meaning**: AI extraction unavailable  
**Impact**: System uses local fallback  
**Solution**: Add API key to `.env` file

### "Gemini API error 429"
**Meaning**: API rate limit exceeded  
**Impact**: Extraction fails temporarily  
**Solution**: Wait a few minutes, try again

### "Unable to load product for editing"
**Meaning**: Product not found in database  
**Impact**: Cannot edit product  
**Solution**: Check product ID, verify database

### "Bulk update failed"
**Meaning**: Database update error  
**Impact**: Changes not saved  
**Solution**: Check permissions, try one at a time

### "Unable to duplicate product"
**Meaning**: Database insert error  
**Impact**: Product not duplicated  
**Solution**: Check database constraints, try manual copy

## Prevention Tips

### Before Uploading PDF
- ✅ Verify PDF is valid and readable
- ✅ Check PDF has text (not just images)
- ✅ Ensure PDF is under 50MB
- ✅ Review PDF structure is clear

### Before Publishing
- ✅ Review all extracted fields
- ✅ Fill in missing specifications
- ✅ Verify images are correct
- ✅ Test showcase page
- ✅ Test presentation mode
- ✅ Check category assignment

### After Publishing
- ✅ Verify product appears in list
- ✅ Check showcase page loads
- ✅ Test all 10 chapters
- ✅ Test presentation mode
- ✅ Verify images load
- ✅ Check specifications display

## Getting Help

### Self-Service
1. Check this troubleshooting guide
2. Review `AUTOMATED_PRODUCT_SYSTEM.md`
3. Check `ADMIN_QUICK_START.md`
4. Review browser console errors
5. Check Supabase logs

### Contact Support
If issue persists:
1. Document the error message
2. Note steps to reproduce
3. Check browser console
4. Export relevant data
5. Contact technical support

### Reporting Bugs
Include:
- Error message (exact text)
- Steps to reproduce
- Browser and version
- Screenshot if applicable
- Console errors
- Expected vs actual behavior

## Known Limitations

### PDF Extraction
- ❌ Cannot extract from scanned images (OCR needed)
- ❌ Cannot extract from password-protected PDFs
- ❌ May struggle with complex layouts
- ❌ Limited to 8 page images

### AI Extraction
- ❌ Requires internet connection
- ❌ Subject to API rate limits
- ❌ May misinterpret ambiguous data
- ❌ Cannot extract from images

### Image Processing
- ❌ Large images may slow down page
- ❌ No automatic image optimization
- ❌ No automatic format conversion
- ❌ Limited to supported formats

### Showcase Generation
- ❌ Fixed 10-chapter structure for Escorts
- ❌ Cannot customize chapter order
- ❌ Cannot add custom chapters
- ❌ Limited template customization

## Future Improvements

Planned enhancements to address limitations:
- [ ] OCR support for scanned PDFs
- [ ] Automatic image optimization
- [ ] Custom chapter templates
- [ ] Bulk PDF upload
- [ ] Advanced CMS editor
- [ ] Multi-language support

---

**Last Updated**: May 7, 2026  
**Version**: 1.0
