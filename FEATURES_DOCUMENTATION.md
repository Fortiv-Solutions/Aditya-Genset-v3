# Product Comparison & Quote Builder Features

## Overview
This document describes the newly implemented Product Comparison and Quote Builder features for the Aditya Genset presentation tool.

---

## 1. Enhanced Product Comparison Feature

### Features
- **Side-by-side comparison** of up to 4 products
- **Dynamic specification matching** - automatically aligns specs across products
- **Export capabilities**:
  - CSV export for spreadsheet analysis
  - PDF export for professional reports
  - Print-friendly layout
- **Share functionality** - Share comparison via link or clipboard
- **Visual product cards** with images, ratings, and quick actions
- **Responsive design** - Works on desktop, tablet, and mobile

### How to Use
1. Navigate to the Products page (`/products/dg-sets`)
2. Click "Add to Compare" on product cards
3. A floating compare bar appears at the bottom showing selected products
4. Click "Compare Now" when you have 2+ products selected
5. On the comparison page:
   - View all specifications side-by-side
   - Export to CSV or PDF
   - Print the comparison
   - Share the comparison link
   - Remove individual products or clear all

### Technical Implementation
- **Context**: `CompareContext.tsx` manages selected product IDs
- **Component**: `CompareBar.tsx` - Floating action bar
- **Page**: `CompareProducts.tsx` - Full comparison view
- **Storage**: LocalStorage for persistence across sessions

### API Endpoints Used
- `fetchPublishedProducts()` - Retrieves all published products with media and specs

---

## 2. Quote Builder Feature

### Features
- **Customer information management** - Capture client details
- **Product selection** - Add multiple products to quote
- **Flexible pricing**:
  - Set custom unit prices per product
  - Apply individual discounts per item
  - Automatic tax calculation (18% GST)
- **Item-level customization**:
  - Quantity adjustment
  - Product-specific notes
- **Quote summary** with real-time calculations:
  - Subtotal
  - Total discount
  - Tax (GST)
  - Grand total
- **Quote management**:
  - Save draft locally
  - Load saved drafts
  - Set quote validity period
  - Add terms and conditions
- **Export options**:
  - Generate PDF quote
  - Send via email
- **Professional layout** optimized for client presentation

### How to Use

#### Creating a Quote
1. Navigate to Quote Builder (`/quote-builder`) via:
   - Navbar link
   - Compare page action button
   - Compare bar "Quote" button
2. Fill in customer information (name, email, company, etc.)
3. Select products from the dropdown
4. For each product:
   - Set quantity
   - Enter unit price
   - Apply discount percentage (optional)
   - Add item-specific notes
5. Add general quote notes and terms
6. Set quote validity period (default: 30 days)
7. Review the summary panel showing totals
8. Generate PDF or send via email

#### Managing Quotes
- **Save Draft**: Saves current quote to browser localStorage
- **Load Draft**: Restores previously saved quote
- **Clear**: Remove all items and reset form

### Technical Implementation
- **Context**: `QuoteContext.tsx` - Manages quote state
- **Page**: `QuoteBuilder.tsx` - Main quote builder interface
- **Calculations**:
  - Item total = (quantity × unit price) - discount
  - Subtotal = sum of all (quantity × unit price)
  - Total discount = sum of all discount amounts
  - Grand total = subtotal - total discount
  - Tax = grand total × 18%
  - Final total = grand total + tax

### Data Structure

```typescript
interface QuoteItem {
  id: string;
  product: any;
  quantity: number;
  unitPrice: number;
  discount: number;
  notes: string;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
}
```

---

## 3. Integration Points

### Navigation
- **Navbar**: Direct link to Quote Builder
- **Compare Bar**: Quick access to both Compare and Quote Builder
- **Compare Page**: Call-to-action card for creating quotes

### Context Providers
Both features are wrapped in context providers in `App.tsx`:
```tsx
<CompareProvider>
  <QuoteProvider>
    {/* App routes */}
  </QuoteProvider>
</CompareProvider>
```

### Routes
- `/compare` - Product comparison page
- `/quote-builder` - Quote builder page

---

## 4. Future Enhancements

### Comparison Feature
- [ ] Add comparison history
- [ ] Save comparison presets
- [ ] Advanced filtering (show only differences)
- [ ] Visual charts for numeric specs
- [ ] Email comparison directly to clients

### Quote Builder
- [ ] PDF generation with company branding
- [ ] Email integration with SMTP
- [ ] Quote templates
- [ ] Multi-currency support
- [ ] Quote versioning and revision tracking
- [ ] Digital signature support
- [ ] Quote approval workflow
- [ ] Integration with CRM/ERP systems
- [ ] Automated follow-up reminders

---

## 5. Dependencies

### UI Components (shadcn/ui)
- Button
- Input
- Label
- Textarea
- Select
- Card
- Table
- DropdownMenu
- Toast notifications

### Icons (lucide-react)
- ArrowLeft, X, Download, Printer, Share2, FileText
- Calculator, Plus, Trash2, Send
- BarChart2, Check, Minus

### Utilities
- React Router for navigation
- LocalStorage for persistence
- Toast notifications for user feedback

---

## 6. Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- LocalStorage support required
- Print functionality requires browser print API
- Share API with clipboard fallback

---

## 7. Performance Considerations
- Products loaded once and cached
- Calculations performed client-side for instant feedback
- LocalStorage used for offline capability
- Lazy loading of product images
- Optimized re-renders with React context

---

## 8. Accessibility
- Keyboard navigation support
- ARIA labels on interactive elements
- Semantic HTML structure
- Focus management
- Screen reader friendly

---

## 9. Testing Checklist

### Comparison Feature
- [ ] Add/remove products from comparison
- [ ] Compare 2, 3, and 4 products
- [ ] Export to CSV
- [ ] Print comparison
- [ ] Share comparison link
- [ ] Clear all products
- [ ] Responsive layout on mobile/tablet
- [ ] LocalStorage persistence

### Quote Builder
- [ ] Add/remove products
- [ ] Update quantities and prices
- [ ] Apply discounts
- [ ] Calculate totals correctly
- [ ] Save and load drafts
- [ ] Customer info validation
- [ ] Generate PDF (placeholder)
- [ ] Send email (placeholder)
- [ ] Responsive layout

---

## 10. Known Limitations
1. **PDF Generation**: Currently shows placeholder toast - requires integration with jsPDF or similar library
2. **Email Sending**: Placeholder implementation - requires backend email service
3. **Product Limit**: Comparison limited to 4 products for optimal UX
4. **LocalStorage**: Quotes stored locally only - no server-side persistence
5. **Currency**: Fixed to INR (₹) - no multi-currency support yet

---

## Support
For questions or issues, contact the development team or refer to the main project README.
