# Rank and Reject 90% Feature - Test Report

## Feature Overview
Manual button to rank applicants using Mistral Rerank API and automatically reject 90% of candidates, keeping only the top 10%.

## Implementation Details

### Button Behavior
- **Location**: Top-right of job applicants section
- **Visible when**: Job has less than 10 applicants
  - Shows: "You have X applicants. You need at least 10 to use this feature."
- **Active when**: Job has 10+ applicants
  - Shows: "Activate Feature: Rank and Reject 90% (Keep Y)" where Y = ceil(applicants.count / 10)

### Feature Logic
- When button is clicked:
  1. System calls `/api/rerank-applicants` with Mistral Rerank API
  2. Mistral ranks applicants by relevance to job requirements
  3. Top 10% of applicants are identified
  4. Remaining 90% are automatically marked as "rejected" in database
  5. Display updates to show only remaining applicants
  6. Confirmation message shows: "Showing Y top-ranked applicants from X total"

### Calculation Examples
| Total Applicants | Keep | Reject |
|------------------|------|--------|
| 10               | 1    | 9      |
| 20               | 2    | 18     |
| 30               | 3    | 27     |
| 50               | 5    | 45     |
| 100              | 10   | 90     |

## Code Changes

### Modified Files
1. **components/job-applicants.tsx**
   - Added `calculateTopCount()` function
   - Added `handleRankAndReject()` async function
   - Replaced button from "AI Rank Applicants" to "Activate Feature: Rank and Reject 90%"
   - Button now positioned top-right and shows conditional text based on applicant count
   - Added loading state and success message display

2. **app/api/rerank-applicants/route.ts**
   - Already created and functional
   - Uses Mistral Rerank API with key: `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`

## Testing Checklist

### Pre-conditions
- User logged in as recruiter
- At least one job posted
- Viewing a job with applicants

### Test Cases

#### 1. Button Visibility (< 10 applicants)
- [ ] Navigate to job with 5 applicants
- [ ] Verify message displays: "You have 5 applicants. You need at least 10 to use this feature."
- [ ] Verify button is NOT active (only informational text shows)

#### 2. Button Activation (>= 10 applicants)
- [ ] Navigate to job with 10 applicants
- [ ] Verify button displays: "Activate Feature: Rank and Reject 90% (Keep 1)"
- [ ] Navigate to job with 20 applicants
- [ ] Verify button displays: "Activate Feature: Rank and Reject 90% (Keep 2)"

#### 3. Feature Activation
- [ ] Click button with 10+ applicants
- [ ] Verify loading state shows "Processing..." with spinner
- [ ] Verify loading message displays: "AI Ranking applicants..."
- [ ] Wait for completion

#### 4. After Ranking
- [ ] Verify success message: "Showing X top-ranked applicants from Y total"
- [ ] Verify applicants display shows only top-ranked ones
- [ ] Verify rejected applicants are marked as "rejected" status in database
- [ ] Verify applicant count in header updates

#### 5. Database Operations
- [ ] Check applicants table for rejected status on 90% of applicants
- [ ] Verify only top 10% remain with "pending" or previous status
- [ ] Verify created_at and updated_at fields

#### 6. Edge Cases
- [ ] Test with exactly 10 applicants (should keep 1)
- [ ] Test with 11 applicants (should keep 2)
- [ ] Test with 100 applicants (should keep 10)
- [ ] Test API failure (should show graceful fallback)
- [ ] Test button click twice (should not double-reject)

#### 7. UI/UX
- [ ] Button is top-right aligned
- [ ] All text is readable in dark mode
- [ ] Loading states are clear
- [ ] Success message is prominent
- [ ] All other applicant features still work (shortlist, reject individual, view details)

## Known Issues
None currently identified. Component compiles successfully with no TypeScript errors.

## Future Enhancements
1. Add confirmation dialog before rejecting 90% of applicants
2. Add undo functionality to restore rejected applicants
3. Add analytics on which applicants were ranked highest
4. Export ranked list with scores

---

**Status**: Ready for Testing  
**Last Updated**: 2026-05-19  
**API Key**: Mistral Rerank configured with provided key
