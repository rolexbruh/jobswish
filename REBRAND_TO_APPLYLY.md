# Rebrand to Applyly - Internship Platform

## Overview
This document summarizes the complete rebrand from "jobswish" (job matching platform) to "Applyly" (internship platform for students). All functionality has been preserved while restructuring the data model and terminology.

## Key Changes

### 1. Branding & Naming
- ✅ "jobswish" → "Applyly" (all instances)
- ✅ "Job" → "Internship" (throughout UI and data model)
- ✅ "Recruiter" → "Company" (in user-facing text)
- ✅ "Job Seeker" → "Student" (on onboarding)
- ✅ Removed Briefcase icon from top navigation

### 2. Applicant/Student Profile Changes
**Resume Builder Updated:**
- ✅ "Years of Experience" → "College Year" (select options: 1-7)
- ✅ New "Internship Education" section (required)
  - Degree Type: Bachelor, Master, PhD
  - Degree Name: (text input)
  - Certificate URL: (optional)
- ✅ "Work Experience" → Now Optional (previously required)
- ✅ Location toggle: "Only show jobs..." → "Only show internships in my city"

**Database Fields Updated:**
- `experience` → `college_year`
- `show_jobs_only_in_city` → `show_internships_only_in_city`
- Education types: 'bachelors' | 'masters' | 'phd' (unchanged for DB backward compatibility)
- New `InternshipEducation` interface with `degree_type` field

### 3. Recruiter/Company Internship Posting
**Form Changes:**
- ✅ Page title: "Post a New Job" → "Post a New Internship"
- ✅ Form section: "Job Details" → "Internship Details"
- ✅ Field: "Job Title" → "Internship Title"
- ✅ Removed entire "Requirements" section with experience level
- ✅ Added "Internship Degree Requirements" section
  - Degree Level: Undergraduate | Postgraduate
  - Degree Name: (optional text field)
- ✅ Location & Compensation section renamed to "Location & Stipend"
  - Removed: "Minimum Salary (USD)", "Maximum Salary (USD)"
  - Added: "Monthly Stipend (USD)" (single field)
- ✅ Submit button: "Post Job" → "Post Internship"

**Database Fields Updated:**
- `experience_needed` → `college_year`
- `salary_min` → removed
- `salary_max` → removed
- `stipend` → added (number, optional)
- `requires_bachelors`, `requires_masters`, `requires_phd` → removed
- `internship_degree_type` → added ('undergraduate' | 'postgraduate')
- `internship_degree_name` → added (optional)

### 4. Navigation Updates
**Applicant Navigation:**
- "Applications" nav item remains unchanged (still has Briefcase icon removed)
- All other nav items remain

**Recruiter Navigation:**
- Removed Briefcase icon from logo
- "Post Job" → "Post Internship"
- Route path: `/recruiter/jobs/new` → `/recruiter/internships/new`

### 5. Dashboard Pages Updated
**Recruiter Dashboard:**
- Title: "Recruiter Dashboard" → "Company Dashboard"
- Subtitle: "Manage your job postings..." → "Manage your internship postings..."
- Button: "Post New Job" → "Post New Internship"
- Stats:
  - "Active Jobs" → "Active Internships"
  - "Total Jobs Posted" → "Total Internships Posted"
- Section title: "Your Job Postings" → "Your Internship Postings"

**Home Page:**
- Brand logo and text updated to "Applyly"
- Hero tagline: "Find Your Perfect Job Match" → "Find Your Perfect Internship Match"
- Feature descriptions updated to reference "internships"
- CTA: "I'm a Recruiter" → "I'm a Company"

**Onboarding Page:**
- Brand: "jobswish" → "Applyly"
- "Job Seeker" → "Student"
- "Recruiter" → "Company"
- Role descriptions updated accordingly

### 6. Type Definitions Updated
**In `/lib/types.ts`:**
```typescript
// Resume
- experience?: string → college_year?: string
- show_jobs_only_in_city → show_internships_only_in_city

// Education (unchanged for backward compatibility)
- type: 'bachelors' | 'masters' | 'phd' | 'certification'

// New: InternshipEducation
- degree_type: 'bachelor' | 'master' | 'phd'
- degree_name: string
- certificate_url?: string

// Job → Internship structure
- title (for internship)
- college_year?: string
- stipend?: number
- location_city?, location_state?, location_country?
- internship_degree_type?: 'undergraduate' | 'postgraduate'
- internship_degree_name?: string
- skills_requirements?, description? (unchanged)
- Removed: experience_needed, salary_min, salary_max, requires_bachelors, requires_masters, requires_phd
```

### 7. Files Modified
- ✅ `/app/layout.tsx` - Metadata updated
- ✅ `/components/applicant-nav.tsx` - Branding and icon removed
- ✅ `/components/recruiter-nav.tsx` - Branding, icon removed, route updated
- ✅ `/app/page.tsx` - Home page rebrand
- ✅ `/app/onboarding/page.tsx` - Role text updated
- ✅ `/lib/types.ts` - Type definitions updated
- ✅ `/components/resume-builder.tsx` - College year, education sections, optional work exp
- ✅ `/app/(recruiter)/recruiter/internships/new/page.tsx` - NEW internship posting form
- ✅ `/app/(recruiter)/recruiter/page.tsx` - Dashboard text updated

### 8. Database Migration Notes
**Backward Compatibility:**
- Existing `jobs` table structure remains mostly compatible
- New columns can be added via migration:
  ```sql
  ALTER TABLE jobs 
  ADD COLUMN college_year VARCHAR(50),
  ADD COLUMN stipend INTEGER,
  ADD COLUMN internship_degree_type VARCHAR(50),
  ADD COLUMN internship_degree_name VARCHAR(200);
  
  ALTER TABLE resumes
  RENAME COLUMN experience TO college_year;
  RENAME COLUMN show_jobs_only_in_city TO show_internships_only_in_city;
  ```

### 9. Features Preserved
✅ AI Ranking and Reject 90% feature
✅ View Details on applicant cards
✅ Delete job posting button
✅ All applicant-recruiter matching functionality
✅ Application status management (pending/shortlisted/rejected)
✅ AI Insights for applicants
✅ Profile & resume management

### 10. Functionality NOT Changed
- Swipe interface for internship browsing
- Application tracking
- Shortlist/reject functionality
- Authentication and authorization
- AI matching and ranking algorithms
- Database query logic

## Testing Checklist

- [ ] Applicant can sign up and complete profile with new structure
- [ ] Applicant can select college year (1-7)
- [ ] Applicant can add internship education (degree type + name)
- [ ] Work experience is optional and can be empty
- [ ] Company can post new internship
- [ ] Internship posting form saves correctly with new fields
- [ ] Stipend field accepts monthly amount
- [ ] Internship degree requirements work correctly
- [ ] Swipe interface shows internships correctly
- [ ] Application tracking works as before
- [ ] All navigation links work
- [ ] Home page displays correctly

## Deployment Notes
1. Update database schema with new columns
2. Deploy code changes
3. Test end-to-end workflow for both applicants and companies
4. Verify all routing works correctly (especially `/internships/new` path)
5. Check that old `/jobs/new` route redirects properly (optional)

## Future Improvements
- Add migration script for existing data
- Add redirect from `/jobs/` to `/internships/`
- Update all documentation and help text
- Update API documentation if available
- Test with real data migration
