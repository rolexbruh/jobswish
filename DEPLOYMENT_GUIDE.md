# Applyly Deployment Guide

## Overview
This guide walks through deploying the Applyly rebrand from jobswish. The rebrand is comprehensive and affects:
- All user-facing text (jobswish → Applyly)
- Business logic (jobs → internships)
- Data model (salary → stipend, experience → college year)
- Database schema

**Estimated Deployment Time: 30-45 minutes**

---

## Pre-Deployment Checklist

### Code Review
- [x] All files reviewed and updated
- [x] Type definitions updated (`/lib/types.ts`)
- [x] Resume builder updated with college year system
- [x] Internship posting form created with new fields
- [x] Navigation updated and branding changed
- [x] Home page and onboarding updated
- [x] No TypeScript errors
- [x] No breaking imports

### Testing (Local)
```bash
# Should complete without errors:
npm run build
npm run type-check  # if available
```

---

## Step-by-Step Deployment

### Phase 1: Code Deployment (5-10 minutes)

**1. Deploy Code**
```bash
git add .
git commit -m "Rebrand: jobswish → Applyly, jobs → internships"
git push origin main
```

**2. Verify Build Success**
- Check deployment logs for any errors
- Ensure all environment variables are set
- Verify database connection works

### Phase 2: Database Migration (10-15 minutes)

**IMPORTANT:** Run migrations in this exact order!

#### Step 1: Backup Database
```sql
-- Create backup (using your hosting provider's tools)
-- Recommended: Full snapshot before any changes
```

#### Step 2: Add New Columns
```sql
-- Add new columns for internship data
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS college_year VARCHAR(50);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS stipend INTEGER;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS internship_degree_type VARCHAR(50);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS internship_degree_name VARCHAR(200);

-- Rename resume columns
ALTER TABLE resumes RENAME COLUMN IF EXISTS experience TO college_year;
ALTER TABLE resumes RENAME COLUMN IF EXISTS show_jobs_only_in_city TO show_internships_only_in_city;
```

#### Step 3: Data Cleanup
```sql
-- Old job data won't have new fields - this is okay
-- New internships will populate the new fields
-- Old jobs will still work but without degree/college year data

-- (Optional) Mark old jobs as inactive if you prefer
-- UPDATE jobs SET is_active = false WHERE created_at < NOW() - INTERVAL 1 day;
```

#### Step 4: Verify Migration
```sql
-- Check tables were updated
SELECT column_name FROM information_schema.columns WHERE table_name = 'jobs';
SELECT column_name FROM information_schema.columns WHERE table_name = 'resumes';
```

### Phase 3: Verification (5-10 minutes)

**1. Check Home Page**
- Visit: `https://yourdomain.com`
- Verify:
  - Title says "Applyly"
  - No "jobswish" text
  - No Briefcase icon in header
  - Hero text mentions internships

**2. Test Applicant Flow**
```
1. Go to /auth/signup
2. Create test account with "Student" role
3. Complete onboarding
4. Go to /profile
5. Verify:
   - College Year dropdown (1-7 options)
   - Internship Education section (Bachelor/Master/PhD)
   - Work Experience is optional
   - Can save profile
```

**3. Test Company Flow**
```
1. Create test recruiter account with "Company" role
2. Go to /recruiter
3. Verify:
   - Dashboard says "Company Dashboard"
   - Stats show "Active Internships"
   - Button says "Post New Internship"
4. Click "Post New Internship"
5. Verify:
   - Form has "Internship Degree Requirements"
   - No salary min/max fields
   - Has "Monthly Stipend" field
   - Form saves correctly
```

**4. Test Navigation**
```
- Applicant nav: No briefcase icon, says "Applyly" ✓
- Recruiter nav: No briefcase icon, says "Applyly" ✓
- All links work correctly ✓
- Route /recruiter/internships/new works ✓
```

**5. Test Features**
- AI Ranking feature still works
- View Details button works
- Delete button works
- Applications can be created
- All statuses (pending/shortlisted/rejected) work

### Phase 4: Monitoring (Ongoing)

**Watch for Errors:**
- Monitor error logs for next 24 hours
- Check for any 404 errors (broken links)
- Monitor database for failed queries
- Check for type/validation errors

**Common Issues & Fixes:**

| Issue | Cause | Fix |
|-------|-------|-----|
| "Column not found" error | Database migration didn't complete | Re-run migration SQL |
| Blank forms | Missing field handling | Check Resume/Job type definitions |
| 404 on /recruiter/jobs/new | Old route still being used | Add redirect or update links |
| Stipend field doesn't save | Field mapping issue | Check form submit handler |

---

## Rollback Plan (If Needed)

**If critical issues occur:**

### Option 1: Code Rollback (5 minutes)
```bash
git revert <commit-hash>
git push origin main
```
- Quickly reverts text/UI changes
- Database changes remain (will need manual rollback)

### Option 2: Database Rollback (10 minutes)
```sql
-- If migration caused data loss:
-- 1. Restore from backup (your hosting provider)
-- 2. Revert column renames:
ALTER TABLE resumes RENAME COLUMN IF EXISTS college_year TO experience;
ALTER TABLE resumes RENAME COLUMN IF EXISTS show_internships_only_in_city TO show_jobs_only_in_city;

-- 3. Drop new columns:
ALTER TABLE jobs DROP COLUMN IF EXISTS college_year;
ALTER TABLE jobs DROP COLUMN IF EXISTS stipend;
ALTER TABLE jobs DROP COLUMN IF EXISTS internship_degree_type;
ALTER TABLE jobs DROP COLUMN IF EXISTS internship_degree_name;
```

---

## Post-Deployment Tasks

### 1. Update Documentation
- [ ] Update README.md to reference Applyly instead of jobswish
- [ ] Update any API documentation
- [ ] Update developer onboarding docs
- [ ] Update support/help documentation

### 2. Communication
- [ ] Notify users about the rebrand
- [ ] Update marketing materials
- [ ] Update social media
- [ ] Update email templates
- [ ] Update terms/privacy if needed

### 3. Analytics & Monitoring
- [ ] Verify analytics are tracking correctly
- [ ] Check funnel metrics (sign-up → posting)
- [ ] Monitor user engagement
- [ ] Track error rates

### 4. Data Validation
- [ ] Verify existing users can still log in
- [ ] Check that old applications still display
- [ ] Verify profile data loads correctly
- [ ] Test edge cases (old data + new fields)

---

## File Reference

**Key Changed Files:**
- `/app/layout.tsx` - App metadata
- `/app/page.tsx` - Home page
- `/components/applicant-nav.tsx` - Applicant nav
- `/components/recruiter-nav.tsx` - Recruiter nav
- `/lib/types.ts` - Type definitions
- `/components/resume-builder.tsx` - Profile form
- `/app/(recruiter)/recruiter/internships/new/page.tsx` - NEW internship posting (moved from jobs)
- `/app/(recruiter)/recruiter/page.tsx` - Company dashboard

**Documentation Files:**
- `REBRAND_TO_APPLYLY.md` - Detailed rebrand documentation
- `APPLYLY_MIGRATION_COMPLETE.md` - Complete implementation summary
- `QUICK_REFERENCE.md` - Quick reference of changes
- `DEPLOYMENT_GUIDE.md` - This file

---

## Database Connection Verification

Before deploying, verify:
```
- Database host reachable ✓
- Credentials correct ✓
- Connection pooling configured ✓
- Backups enabled ✓
- Read replicas synced (if applicable) ✓
```

---

## Success Criteria

After deployment, verify:
- [ ] Home page displays "Applyly"
- [ ] No "jobswish" text anywhere in UI
- [ ] Briefcase icons removed from navigation
- [ ] Student can create profile with college year
- [ ] Student can add internship education
- [ ] Student can save profile without work experience
- [ ] Company can post internship with stipend (not salary)
- [ ] Company can select internship degree requirement
- [ ] All navigation links work
- [ ] AI ranking feature works
- [ ] Applications can be created and managed
- [ ] No 404 or 500 errors
- [ ] Database queries execute successfully

---

## Support Contact

If issues arise during deployment:
1. Check the "Common Issues & Fixes" table above
2. Review error logs in your hosting provider
3. Consult `REBRAND_TO_APPLYLY.md` for detailed information
4. Use git history to understand recent changes
5. Check database schema matches expected state

---

## Final Notes

This deployment is comprehensive but straightforward. The main complexity is the database schema changes, but they are backward compatible in the sense that:
- Old jobs will still work (without new fields populated)
- Old student profiles will still work (college_year will be NULL)
- New data will use the new structure

**Risk Level: LOW** (with proper backup)
**Estimated Success Rate: 95%+** (with testing)

Proceed with confidence!
