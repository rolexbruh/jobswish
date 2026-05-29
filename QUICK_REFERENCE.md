# Applyly Rebrand - Quick Reference

## Text Replacements Done
- "jobswish" → "Applyly" ✅
- "Job" → "Internship" ✅
- "Recruiter" → "Company" ✅
- "Job Seeker" → "Student" ✅

## Profile Form Changes
**From:**
- Years of Experience dropdown (0-1, 1-3, 3-5, 5-10, 10+)
- Education section (Bachelor, Master, PhD, Certification)
- Work Experience (mandatory, at least 1 entry)

**To:**
- College Year dropdown (1st, 2nd, 3rd, 4th, 5th, 6th, 7th Year)
- Internship Education section (Bachelor, Master, PhD only)
- Work Experience (optional, can be empty)
- Certificate URL field for internship education

## Internship Posting Form Changes
**Removed:**
- Experience Level dropdown
- Education Requirements checkboxes (Bachelor/Master/PhD)
- Minimum Salary field
- Maximum Salary field

**Added:**
- Internship Degree Requirements section
- Degree Level dropdown (Undergraduate / Postgraduate)
- Optional Degree Name field
- Monthly Stipend field (single field, not min/max)

## Navigation Changes
**Removed:**
- Briefcase icon from app header (both applicant & recruiter)

**Updated:**
- Brand text: "jobswish" → "Applyly"
- Route: `/recruiter/jobs/new` → `/recruiter/internships/new`
- Nav label: "Post Job" → "Post Internship"

## Database Fields

### Resumes Table
- `experience` → `college_year` (string: "1"-"7")
- `show_jobs_only_in_city` → `show_internships_only_in_city`

### Jobs Table
**Removed:**
- `experience_needed`
- `salary_min`
- `salary_max`
- `requires_bachelors`
- `requires_masters`
- `requires_phd`

**Added:**
- `college_year` (string, optional)
- `stipend` (integer, optional)
- `internship_degree_type` (string: 'undergraduate' | 'postgraduate', optional)
- `internship_degree_name` (string, optional)

## Files Changed
1. `/app/layout.tsx` - Metadata
2. `/app/page.tsx` - Home page
3. `/app/onboarding/page.tsx` - Onboarding roles
4. `/components/applicant-nav.tsx` - Navigation
5. `/components/recruiter-nav.tsx` - Navigation
6. `/lib/types.ts` - Type definitions
7. `/components/resume-builder.tsx` - Profile form
8. `/app/(recruiter)/recruiter/internships/new/page.tsx` - NEW (moved from jobs)
9. `/app/(recruiter)/recruiter/page.tsx` - Dashboard

## Features Unchanged
- Swipe interface ✅
- AI Ranking (90% auto-reject) ✅
- View Details button ✅
- Delete internship button ✅
- Application tracking ✅
- All database operations ✅

## Deployment Checklist
- [ ] Database schema migrated
- [ ] Code deployed
- [ ] Home page displays correctly
- [ ] Onboarding works
- [ ] Profile form shows college year & internship education
- [ ] Internship posting form has degree requirements & stipend
- [ ] Navigation shows "Applyly" without briefcase icon
- [ ] All routes work (/recruiter/internships/new not /recruiter/jobs/new)
- [ ] AI ranking feature works
- [ ] Applications can be created and managed
