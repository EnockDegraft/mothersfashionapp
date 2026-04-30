# Mother Clothing Ltd. - Setup Checklist

Use this checklist to ensure your application is properly configured and ready to use.

## Pre-Setup Requirements

- [ ] Node.js 18+ installed
- [ ] pnpm package manager available
- [ ] Supabase account created
- [ ] Access to Supabase project dashboard

## 1. Environment Configuration

- [ ] Copy `.env.local.example` to `.env.local` (if exists)
- [ ] Add `NEXT_PUBLIC_SUPABASE_URL` from Supabase project
- [ ] Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` from Supabase project
- [ ] Verify no sensitive keys are committed to git

## 2. Database Setup

- [ ] Execute `scripts/001_tables_profiles.sql`
- [ ] Execute `scripts/002_tables_products.sql`
- [ ] Execute `scripts/003_tables_inventory.sql`
- [ ] Execute `scripts/004_tables_customers.sql`
- [ ] Execute `scripts/005_tables_orders.sql`
- [ ] Execute `scripts/006_tables_order_items.sql`
- [ ] Execute `scripts/007_tables_transactions.sql`
- [ ] Execute `scripts/008_triggers.sql`
- [ ] Create `is_admin()` function
- [ ] Execute `scripts/002_rls_policies.sql`
- [ ] Verify all tables exist in Supabase
- [ ] Verify RLS is enabled on all tables

## 3. Local Development Setup

- [ ] Run `pnpm install` to install dependencies
- [ ] Run `pnpm dev` to start development server
- [ ] Verify server runs on `http://localhost:3000`
- [ ] Check for any console errors

## 4. Authentication Testing

- [ ] Navigate to home page (/)
- [ ] Click "Sign Up" link
- [ ] Create test Admin account
  - [ ] Full name entered
  - [ ] Email valid
  - [ ] Role set to "Admin"
  - [ ] Strong password created
- [ ] Submit signup form
- [ ] Check for confirmation email (if configured)
- [ ] Login with test Admin account
- [ ] Verify redirect to dashboard
- [ ] Logout and verify redirect to login

## 5. Inventory Module Testing

- [ ] From dashboard, click "Inventory"
- [ ] Click "Add Product" button
- [ ] Create test product:
  - [ ] Name: "Test T-Shirt"
  - [ ] SKU: "TEST-001"
  - [ ] Category: "Shirts"
  - [ ] Price: 19.99
  - [ ] Reorder Level: 5
- [ ] Submit form
- [ ] Verify product appears in list
- [ ] Click product name to view details
- [ ] Click "Add Adjustment"
- [ ] Add 50 units with reason "Add (Receipt)"
- [ ] Verify stock updated
- [ ] Verify transaction logged in history

## 6. Customer Module Testing

- [ ] From dashboard, click "Customers"
- [ ] Click "Add Customer" button
- [ ] Create test customer:
  - [ ] Name: "John Doe"
  - [ ] Email: "john@example.com"
  - [ ] Phone: "555-1234"
  - [ ] Business: "Test Retail"
  - [ ] Address filled in
- [ ] Submit form
- [ ] Verify customer appears in list
- [ ] Click customer name to view details
- [ ] Verify no orders yet
- [ ] Click "Edit" and modify information
- [ ] Save changes and verify update

## 7. Order Module Testing

- [ ] From dashboard, click "Orders"
- [ ] Click "Create Order" button
- [ ] Create test order:
  - [ ] Select test customer
  - [ ] Order type: "Wholesale"
  - [ ] Status: "Pending"
  - [ ] Total: 999.99
- [ ] Submit form
- [ ] Verify order appears in list
- [ ] Verify status shows as "Pending"
- [ ] Click order to view details (if detail page exists)

## 8. Analytics Testing

- [ ] From dashboard, click "Reports"
- [ ] Verify dashboard displays:
  - [ ] Total Orders stat (should show 1)
  - [ ] Total Revenue stat
  - [ ] Total Products stat (should show 1)
  - [ ] Low Stock Items stat
- [ ] Verify charts load
- [ ] Verify data visualization displays

## 9. Search & Filtering

- [ ] Go to Inventory
- [ ] Search for product "T-Shirt"
- [ ] Verify results filter correctly
- [ ] Clear search, verify all products show
- [ ] Go to Customers
- [ ] Search for "john"
- [ ] Verify filtering works
- [ ] Go to Orders
- [ ] Verify search functionality

## 10. User Roles Testing

- [ ] Create second account with "Sales Personnel" role
- [ ] Login with sales account
- [ ] Verify can view inventory
- [ ] Verify can create orders
- [ ] Verify can view customers
- [ ] Verify CAN view reports
- [ ] Verify CANNOT edit products
- [ ] Verify CANNOT add new products
- [ ] Logout and login with Admin account
- [ ] Verify Admin can do everything
- [ ] Verify Admin has edit/delete buttons sales personnel don't see

## 11. Data Integrity

- [ ] Delete a product
- [ ] Verify inventory record handled properly
- [ ] Delete a customer
- [ ] Verify orders handled properly
- [ ] Check database for orphaned records

## 12. Performance Verification

- [ ] Load page with many records
- [ ] Verify page loads quickly
- [ ] Search functions respond in <1 second
- [ ] No console errors or warnings

## 13. Mobile Responsiveness

- [ ] Test on mobile browser (375px width)
- [ ] Verify layout adapts correctly
- [ ] Verify buttons clickable
- [ ] Verify forms readable

## 14. Browser Compatibility

- [ ] Test on Chrome
- [ ] Test on Firefox
- [ ] Test on Safari
- [ ] Test on Edge

## 15. Production Deployment (Optional)

- [ ] Read DEPLOYMENT.md
- [ ] Choose deployment platform (Vercel recommended)
- [ ] Configure domain name
- [ ] Set up SSL certificate
- [ ] Test all features on production URL
- [ ] Set up monitoring/logging
- [ ] Configure backups
- [ ] Test backup restoration

## 16. Security Checklist

- [ ] Verify RLS policies active on all tables
- [ ] Verify email confirmation required (if desired)
- [ ] Verify passwords hashed
- [ ] Verify sensitive data in .env.local
- [ ] Verify .env.local in .gitignore
- [ ] Verify no hardcoded credentials
- [ ] Set up HTTPS for all URLs
- [ ] Configure CORS properly
- [ ] Enable security headers

## 17. Documentation Review

- [ ] Read README.md
- [ ] Review QUICKSTART.md
- [ ] Check DATABASE_SETUP.md
- [ ] Review DEPLOYMENT.md
- [ ] Understand data model from DATABASE_SETUP.md

## 18. Testing Cleanup

- [ ] Delete test data created
- [ ] Delete test accounts
- [ ] Verify database is clean
- [ ] Verify no debug logs in production

## 19. User Training

- [ ] Document custom processes
- [ ] Create user guides for staff
- [ ] Train Admin users
- [ ] Train Sales Personnel users
- [ ] Create troubleshooting guide

## 20. Go Live

- [ ] Backup original data
- [ ] Announce system to team
- [ ] Monitor first day closely
- [ ] Be available for support
- [ ] Collect feedback
- [ ] Plan improvements

## Post-Launch Maintenance

### Week 1
- [ ] Monitor for errors daily
- [ ] Respond to user feedback
- [ ] Train any additional users
- [ ] Check database performance

### Month 1
- [ ] Review usage patterns
- [ ] Optimize based on feedback
- [ ] Test backup procedures
- [ ] Review security logs

### Ongoing
- [ ] Regular data backups
- [ ] Monitor performance
- [ ] Keep documentation updated
- [ ] Plan feature enhancements

## Troubleshooting Notes

If you encounter issues:

1. **Database Connection Errors**
   - Verify .env.local has correct values
   - Check Supabase project is running
   - Verify API key permissions

2. **Authentication Errors**
   - Clear browser cookies
   - Check email confirmation status
   - Verify user role in profiles table

3. **Missing Data**
   - Verify RLS policies
   - Check user permissions
   - Review database for records

4. **Performance Issues**
   - Check Supabase usage limits
   - Review query performance
   - Clear browser cache

5. **Styling Issues**
   - Verify Tailwind CSS compiled
   - Check component imports
   - Clear next cache: `rm -rf .next`

## Support Resources

- **README.md** - Full documentation
- **QUICKSTART.md** - Getting started guide
- **DATABASE_SETUP.md** - Database configuration
- **DEPLOYMENT.md** - Deployment instructions
- **PROJECT_SUMMARY.md** - Project overview
- **Supabase Docs** - https://supabase.com/docs
- **Next.js Docs** - https://nextjs.org/docs

## Final Verification

- [ ] All checkboxes completed
- [ ] No errors in console
- [ ] All modules tested
- [ ] Users trained
- [ ] Backups configured
- [ ] Monitoring active
- [ ] Ready for production use

---

**Date Completed**: _______________

**Completed By**: _______________

**Notes/Issues Found**: _______________

**Next Steps**: _______________
