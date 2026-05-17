# jobswish Troubleshooting Guide

## Common Issues & Solutions

### Authentication Issues

#### "Invalid credentials" on login
**Problem**: Email or password is incorrect
**Solution**: 
- Double-check your email and password
- Remember passwords are case-sensitive
- Click "Forgot Password" if you can't remember
- Create a new account if needed

#### Email verification not working
**Problem**: Didn't receive confirmation email
**Solution**:
- Check spam/junk folder
- Verify `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` in `.env.local`
- For local: should be `http://localhost:3000/auth/callback`
- For production: should be `https://yourapp.vercel.app/auth/callback`
- Request a new verification email from the confirmation page

#### "Unauthorized" error on protected pages
**Problem**: Session expired or invalid token
**Solution**:
- Log out and log back in
- Clear browser cookies and cache
- Restart development server
- Check Supabase Auth is enabled

### Profile & Resume Issues

#### "No resume found" when trying to swipe
**Problem**: You haven't created a resume yet
**Solution**:
1. Click on "Profile" in the navigation
2. Fill out your basic information (name, email, etc.)
3. Add at least one education entry or work experience
4. Click "Save Resume"
5. Return to Swipe section

#### "Failed to fetch resume" error
**Problem**: Database connection issue or missing resume
**Solution**:
- Refresh the page
- Ensure you've completed the resume creation
- Check browser console for detailed error
- Verify Supabase credentials are correct

#### Can't update profile
**Problem**: Profile update failed
**Solution**:
- Check that all required fields are filled
- Ensure email is in valid format
- Try again in a few seconds (rate limiting)
- Check network connection

### Job Swiping Issues

#### No jobs appear to swipe
**Problem**: No jobs available or all jobs already swiped
**Solution**:
- Post new jobs as a recruiter
- Clear rejected jobs cache (browser console: `localStorage.clear()`)
- Verify you're logged in as a job seeker
- Check that jobs are active and not expired

#### Swipe not registering
**Problem**: Application didn't submit
**Solution**:
- Check internet connection
- Ensure resume is complete
- Try swiping again
- Check browser console for errors
- Refresh page and try again

#### Can't see who applied to my jobs
**Problem**: Applications not showing in recruiter dashboard
**Solution**:
- Ensure you're logged in as recruiter
- Check that the job is posted under your account
- Refresh the page
- Wait a moment for real-time updates

### AI Insights Issues

#### "Daily limit reached" message
**Problem**: You've already used your daily AI insight
**Solution**:
- Each user gets 1 free AI insight per day
- Come back tomorrow for a new analysis
- The limit resets at midnight UTC

#### AI Insights not generating
**Problem**: API error or no resume data
**Solution**:
- Ensure your resume is complete with skills
- Check that NVIDIA API keys are correct in `.env.local`
- Verify internet connection
- Try again in a few moments
- Check browser console for specific error

#### AI Insights taking too long
**Problem**: API is slow or unresponsive
**Solution**:
- Wait up to 30 seconds
- Refresh and try again
- Check that API key is valid
- Verify NVIDIA API service is online

### Applications Issues

#### Applications page shows "Server Error"
**Problem**: Database query failed
**Solution**:
1. Refresh the page
2. Log out and log back in
3. Check that resume exists (even if empty)
4. Clear browser cache
5. Check Supabase logs for detailed errors

#### Application status not updating
**Problem**: Real-time update delayed
**Solution**:
- Refresh the page manually
- Status updates within a few seconds
- Check as recruiter that you've changed status
- Verify application exists

#### Can't apply to a job
**Problem**: Application submission failed
**Solution**:
- Ensure you have a complete resume
- Check job hasn't expired
- Verify internet connection
- Try refreshing and applying again
- Check for duplicate applications (each job once per user)

### Job Posting Issues

#### Job posting failed
**Problem**: Required field missing or error
**Solution**:
- Ensure Job Title is filled in
- Fill in at least basic information
- Check all dates are valid
- Verify salary numbers are positive
- Check for XSS characters in text fields

#### Job not appearing for applicants
**Problem**: Job isn't published or visible
**Solution**:
- Ensure job is marked as "Active"
- Verify job is associated with your account
- Check job hasn't expired (60 days default)
- Refresh applicant's browser

#### Can't edit a job after posting
**Problem**: Editing not available
**Solution**:
- For MVP, you can delete and repost
- Delete job to remove it
- Post a new job with updated details

### Applicant Management Issues

#### Can't see applicant details
**Problem**: Permission or data loading issue
**Solution**:
- Ensure you're the recruiter who posted the job
- Refresh the page
- Click back to job and try again
- Check applicant has completed resume

#### Can't change applicant status
**Problem**: Update failed or not authorized
**Solution**:
- Ensure you're recruiter for that job
- Verify applicant exists
- Try refreshing page
- Check for any error messages in console

#### Applicant list not loading
**Problem**: Database query timeout
**Solution**:
- Refresh the page
- Wait a moment and try again
- Check internet connection
- Verify job exists and has applicants

### UI/UX Issues

#### Dark theme not applying
**Problem**: CSS not loaded or browser cached
**Solution**:
- Hard refresh browser (Ctrl+F5 or Cmd+Shift+R)
- Clear browser cache
- Check that `app/globals.css` is properly imported
- Verify dark class is on `<html>` tag

#### Buttons not responding
**Problem**: JavaScript not loaded
**Solution**:
- Refresh page
- Check browser console for JS errors
- Verify JavaScript is enabled in browser
- Clear browser cache and restart

#### Mobile layout broken
**Problem**: Responsive CSS issue
**Solution**:
- Check viewport meta tag exists
- Refresh browser
- Rotate device if on mobile
- Clear browser cache

### Performance Issues

#### Page loading slowly
**Problem**: Large data sets or slow connection
**Solution**:
- Check internet connection speed
- Reduce number of displayed items
- Optimize images if any
- Check browser DevTools Performance tab

#### Swipe animations stuttering
**Problem**: GPU acceleration issue
**Solution**:
- Close other browser tabs
- Disable browser extensions
- Check device isn't overloaded
- Try different browser

### Database Issues

#### "RLS violation" error
**Problem**: Row Level Security preventing access
**Solution**:
- Ensure you're accessing your own data
- Verify you're logged in with correct account
- Check RLS policies in Supabase dashboard
- Don't manually try to access other users' data

#### Database quota exceeded
**Problem**: Free tier limits reached
**Solution**:
- Upgrade Supabase plan
- Delete old test data
- Archive inactive records
- Monitor database usage

### Deployment Issues

#### "Build failed" on Vercel
**Problem**: Build-time error
**Solution**:
- Check environment variables are set
- Verify all required packages installed
- Check TypeScript errors with `npm run build`
- Review Vercel build logs for details

#### App working locally but not on Vercel
**Problem**: Missing environment variables or configuration
**Solution**:
- Add all env vars to Vercel dashboard
- Check Supabase redirect URLs include Vercel URL
- Verify database migrations ran
- Check Vercel logs for runtime errors

#### Deployed app showing old version
**Problem**: Cache issue or old deployment
**Solution**:
- Force redeploy in Vercel dashboard
- Clear browser cache
- Wait 5 minutes for CDN cache
- Check commit was actually deployed

## Still Having Issues?

### Debug Steps

1. **Check browser console**
   - Open DevTools (F12 or right-click > Inspect)
   - Look for red error messages
   - Check Network tab for failed requests

2. **Check Supabase logs**
   - Go to Supabase dashboard
   - Check Logs section
   - Look for database errors

3. **Check Vercel logs** (if deployed)
   - Go to Vercel dashboard
   - Click project > Deployments
   - View build and runtime logs

4. **Enable debug mode**
   - Add `console.log("[v0]", ...)` to track execution
   - Check what data is being received
   - Verify API responses

### Support Resources

- **Supabase Documentation**: https://supabase.com/docs
- **Next.js Documentation**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com

### Reporting Issues

When reporting issues, include:
1. Exact error message
2. Steps to reproduce
3. Browser and OS
4. Screenshots if applicable
5. Console error logs
6. Environment details (local/deployed)
