# jobswish - AI-Powered Job Matching Platform

A modern, Tinder-style job matching application that connects job seekers with opportunities and recruiters with qualified candidates.

## ✨ Features

### For Job Seekers
- **Tinder-Style Swiping**: Swipe right to apply, left to skip jobs with fluid animations
- **Smart Job Matching**: AI-powered recommendations based on your profile
- **Resume Builder**: Create and manage your professional resume with education and work experience
- **AI Insights**: Get personalized, actionable feedback once per day to improve your job search
- **Application Tracking**: Monitor the status of all your applications in one place
- **Location Filtering**: Find jobs in your preferred city or browse opportunities worldwide

### For Recruiters
- **Job Posting Management**: Post jobs with detailed requirements, skills, and compensation
- **Applicant Management**: Review, shortlist, or reject candidates across all posted jobs
- **Centralized Dashboard**: View stats on active jobs and incoming applications
- **Candidate Profiles**: Access detailed resumes with education and work history
- **Status Tracking**: Organize applicants by pending, shortlisted, and rejected status

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 with React 19
- **Styling**: Tailwind CSS v4 with dark theme
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth with email/password
- **AI**: NVIDIA API (Llama 2) for personalized insights
- **Animations**: Framer Motion for smooth swipe interactions
- **UI Components**: shadcn/ui with custom dark mode

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and pnpm/npm
- Supabase account and project
- NVIDIA API keys (included in .env.example)

### Installation

1. **Install dependencies**
```bash
pnpm install
```

2. **Set up environment variables**
```bash
cp .env.example .env.local
```

Update `.env.local` with your Supabase credentials from your project settings.

3. **Run the development server**
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📊 Database Schema

Main tables with Row Level Security:
- **profiles**: User accounts (job seekers or recruiters)
- **resumes**: Job seeker profiles with contact info
- **education**: Educational background entries
- **work_experience**: Previous employment records
- **jobs**: Job postings by recruiters
- **applications**: Job applications with status tracking
- **rejected_jobs**: Jobs swiped left by applicants
- **ai_insights_usage**: Daily limit tracking for AI insights

## 🔐 Authentication

Email/password authentication with role selection during signup:
- **Job Seeker**: Browse jobs and build resume
- **Recruiter**: Post jobs and manage applicants

## 🎨 Design

Sophisticated dark blue and black color scheme:
- Primary blue for actions and highlights
- Black/dark gray for backgrounds
- Smooth transitions and hover states
- Mobile-first responsive design

## 📱 Key Features

### Swipe Interface
- Right arrow (💚) to apply to a job
- Left arrow (❌) to pass and hide forever
- Smooth card animations
- Auto-loads more jobs as you progress

### Resume Builder
- Add education entries (Bachelor's, Master's, PhD, Certification)
- Track work experience with company names
- Save GitHub profile and project links
- Set city preferences
- Option to only view jobs in your location

### AI Insights
- Analyzes your complete profile
- Provides 3-4 actionable recommendations
- Identifies strengths and improvement areas
- Suggests matching job types
- Limited to once per day per user

### Recruiter Dashboard
- View all job postings with application counts
- Click jobs to see applicants
- Shortlist or reject candidates quickly
- View full candidate resumes
- Stats for active jobs and applications

## 🚢 Deployment

Ready for Vercel deployment:
1. Connect your GitHub repository
2. Add environment variables
3. Deploy automatically

## 📝 API Routes

### POST `/api/insights`
Generate AI-powered profile insights
- Requires authentication and resume
- Limited to once per day
- Uses NVIDIA Llama 2 model

## 🐛 Troubleshooting

**Applications Page Error**: Ensure your resume is created in the Profile section first

**AI Insights Not Working**: Check that:
- You have a resume created
- Environment variables are set correctly
- NVIDIA API key is valid

**Swipe Interface Issues**: 
- Clear browser cache
- Check that you're logged in as a job seeker
- Verify jobs are available in the database

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)

## 📄 License

Proprietary - All rights reserved to jobswish

---

**Version**: 1.0.0  
**Built with**: v0 + Next.js 15  
**Status**: Production Ready
