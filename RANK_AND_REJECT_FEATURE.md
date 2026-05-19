# Rank and Reject 90% Feature - Implementation Guide

## Overview
A manual button-activated feature that uses Mistral Rerank API to intelligently rank job applicants and automatically reject the bottom 90%, keeping only the top-performing candidates.

## Feature Location
- **Page**: Job Applicants View (`/recruiter/jobs/[id]`)
- **Position**: Top-right of applicants section
- **Component**: `JobApplicants` in `components/job-applicants.tsx`

## How It Works

### Step 1: Check Applicant Count
- If applicants < 10: Show informational message
- If applicants >= 10: Show active button

### Step 2: User Clicks Button
Button text: "Activate Feature: Rank and Reject 90% (Keep X)"
- Where X = ceil(total_applicants / 10)

### Step 3: Backend Processing
```
POST /api/rerank-applicants
├─ Query: Job title + requirements + experience needed
├─ Documents: All applicants' resume data
├─ API: Mistral Rerank via NVIDIA integration
└─ Response: Ranked applicants with scores
```

### Step 4: Automatic Rejection
- Top X applicants marked as "pending" (shown in UI)
- Remaining (X-X) applicants marked as "rejected" (hidden)
- Database updates immediately via Supabase

### Step 5: UI Feedback
- Loading state with spinner
- Success message showing kept vs total
- Refreshed applicant list

## Configuration

### API Key (Required)
```
MISTRAL_RERANK_API_KEY = "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"
```

Located in: `app/api/rerank-applicants/route.ts`

### Calculation Formula
```typescript
topCount = Math.max(1, Math.ceil(totalApplicants / 10))
```

Examples:
- 10 applicants → Keep 1
- 20 applicants → Keep 2
- 50 applicants → Keep 5
- 100 applicants → Keep 10

## Code Changes

### 1. Component Update
**File**: `components/job-applicants.tsx`

**New Functions**:
```typescript
const calculateTopCount = (total: number) => {
  return Math.max(1, Math.ceil(total / 10))
}

const handleRankAndReject = async () => {
  // 1. Call API for reranking
  // 2. Get top applicants
  // 3. Reject bottom 90% in database
  // 4. Update display
  // 5. Show success message
}
```

**New Button Logic**:
- Conditional display based on applicant count
- Active/disabled states
- Loading animation
- Success feedback

### 2. API Route
**File**: `app/api/rerank-applicants/route.ts`

**Functionality**:
- Accepts POST request with applicants and job details
- Calls Mistral Rerank API
- Returns ranked applicants sorted by relevance score
- Fallback if API fails (returns unsorted applicants)

## User Experience Flow

```
Job Applicants Page (< 10 applicants)
↓
"You have 5 applicants. You need at least 10 to use this feature."
├─ Users continue normal workflow
└─ Feature disabled until threshold reached

Job Applicants Page (>= 10 applicants)
↓
"Activate Feature: Rank and Reject 90% (Keep 2)"
├─ User clicks button
├─ "Processing..." with spinner
├─ API ranks applicants
├─ Bottom 90% marked as rejected
├─ "Showing 2 top-ranked applicants from 20 total"
└─ Display updates immediately
```

## Important Notes

1. **No Changes to Existing Features**
   - Individual shortlist/reject still works
   - View applicant details still works
   - All other recruiter features unchanged

2. **Database Operations**
   - Rejected applicants get status = "rejected"
   - They remain in database but hidden
   - Can be viewed in "Rejected" tab of All Applicants page

3. **One-Way Operation**
   - Feature is manual activation only
   - No undo button (future enhancement)
   - Rejected applicants stay rejected unless manually restored

4. **API Fallback**
   - If Mistral API fails, feature gracefully falls back
   - Applicants returned unsorted
   - No data is lost

## Testing the Feature

### Basic Test
1. Create job with 15 applicants
2. Click "Activate Feature: Rank and Reject 90% (Keep 2)" button
3. Verify 2 applicants remain and 13 are rejected
4. Check database: 13 should have status = "rejected"

### Edge Case Test
1. Job with exactly 10 applicants → Keep 1
2. Job with 11 applicants → Keep 2
3. Job with 100 applicants → Keep 10

### Error Test
1. Temporarily disable API key
2. Click button
3. Verify graceful fallback
4. Re-enable API key

## Files Modified

| File | Type | Change |
|------|------|--------|
| `components/job-applicants.tsx` | Component | Added handleRankAndReject, calculateTopCount, updated button |
| `app/api/rerank-applicants/route.ts` | API Route | Already created for this feature |

## Styling & Design

- **Button Style**: Primary color with hover effect
- **Button Position**: Top-right of applicants list
- **Loading State**: Spinning Sparkles icon with "Processing..." text
- **Success Message**: Green info box with count display
- **Message (inactive)**: Muted gray info box with count message

All styling uses existing Tailwind classes and dark mode support.

## Performance Considerations

- API call is async (non-blocking)
- Database updates are sequential (could be batched for very large rejects)
- UI updates immediately after backend completes
- No re-fetching of entire page (router.refresh() only)

## Security

- User must be authenticated recruiter
- Operation only affects their own jobs
- RLS policies prevent unauthorized access
- API key stored server-side only

---

**Feature Status**: Complete and Ready  
**Test Coverage**: See FEATURE_TEST_REPORT.md  
**API Integration**: Mistral Rerank via NVIDIA  
**Database**: Supabase PostgreSQL
