# jobswish Setup Guide

## Step-by-Step Setup Instructions

### 1. Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
# Get these from your Supabase project settings
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Development redirect URL (for testing locally)
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback

# AI API Keys (pre-configured)
NVIDIA_API_KEY=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
BGE_API_KEY=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
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Database Setup

The database schema is created automatically. If you need to manually set it up:

1. Go to your Supabase project dashboard
2. Open the SQL editor
3. Run the SQL from `scripts/001_create_schema.sql`
4. Run the SQL from `scripts/002_profile_trigger.sql`

### 4. Start Development Server

```bash
pnpm dev
```

The app will be available at `http://localhost:3000`

### 5. First Time Setup

1. **Create your first account**
   - Go to [Sign Up](http://localhost:3000/auth/signup)
   - Choose "Job Seeker" or "Recruiter"
   - Verify your email (check spam folder)

2. **As a Job Seeker**
   - Complete your resume in the Profile section
   - Add education and work experience
   - Visit the Swipe section to start applying to jobs

3. **As a Recruiter**
   - Post your first job
   - Wait for job seekers to apply
   - Manage applicants from the dashboard

## Supabase Configuration

### Enable Email Authentication

1. Go to Authentication > Providers
2. Ensure Email provider is enabled
3. Configure email templates if needed

### Configure CORS (for production)

1. Go to Authentication > URL Configuration
2. Add your production URL to "Redirect URLs"

Example:
```
http://localhost:3000
https://yourapp.vercel.app
```

## Testing the App

### Test Accounts

Create test accounts for both roles:
- Recruiter account: post jobs and review applications
- Job seeker account: build resume and swipe on jobs

### Test Data

After creating accounts, you can:
1. Post a test job as recruiter
2. Create a test resume as job seeker
3. Swipe and apply to the test job
4. Check application status

## Deployment to Vercel

### Prerequisites
- GitHub account with code pushed
- Vercel account

### Steps

1. **Connect GitHub to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Select your GitHub repository

2. **Add Environment Variables**
   - In Vercel dashboard, go to Settings > Environment Variables
   - Add all variables from `.env.example`:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `NVIDIA_API_KEY`
     - `BGE_API_KEY`

3. **Update Supabase CORS**
   - Add your Vercel URL to Supabase redirect URLs
   - Format: `https://yourapp.vercel.app`

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically deploy on every push to main

## Common Issues & Solutions

### "Failed to fetch resume"
- Ensure user has created a resume in the Profile section
- Check browser console for detailed error

### "Daily limit reached" on AI Insights
- Each user gets one free AI insight per day
- Wait until tomorrow or check back later

### "Unauthorized" error
- Verify you're logged in
- Check that Supabase credentials are correct
- Clear browser cookies and try again

### Email verification not working
- Check spam/junk folder
- Verify `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` is correct
- Check Supabase email templates

## Database Backup

To backup your Supabase data:

1. Go to Supabase Dashboard
2. Click "Backups" in the sidebar
3. Click "Create Backup"
4. Download the backup file

## Performance Tips

1. **Index frequently queried columns**
   ```sql
   CREATE INDEX idx_resumes_user_id ON public.resumes(user_id);
   CREATE INDEX idx_jobs_recruiter_id ON public.jobs(recruiter_id);
   CREATE INDEX idx_applications_applicant_id ON public.applications(applicant_id);
   ```

2. **Enable query performance monitoring**
   - Monitor slow queries in Supabase dashboard
   - Optimize with proper indexes

3. **Cache resume data**
   - Resume data is cached client-side
   - Refresh manually if needed

## Security Notes

- All data is protected with Row Level Security (RLS)
- Passwords are hashed and salted by Supabase
- API keys are never exposed to the client
- Email verification prevents fake accounts

## Need Help?

- Check `TROUBLESHOOTING.md` for common issues
- Review `README.md` for feature documentation
- Check browser console for detailed error messages
- Review Supabase logs for database errors
