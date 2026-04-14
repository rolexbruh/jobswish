-- Profiles table for both applicants and recruiters
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT CHECK (role IN ('applicant', 'recruiter')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resumes table for applicants
CREATE TABLE IF NOT EXISTS public.resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT,
  github_link TEXT,
  experience TEXT,
  skills_strengths TEXT,
  project_links TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  show_jobs_only_in_city BOOLEAN DEFAULT FALSE,
  embedding VECTOR(1024),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Education entries for resumes
CREATE TABLE IF NOT EXISTS public.education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('bachelors', 'masters', 'certification', 'phd')),
  degree_name TEXT NOT NULL,
  certificate_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Previous companies/work experience
CREATE TABLE IF NOT EXISTS public.work_experience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  company_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs posted by recruiters
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  experience_needed TEXT,
  salary_min INTEGER,
  salary_max INTEGER,
  location_city TEXT,
  location_state TEXT,
  location_country TEXT,
  requires_bachelors BOOLEAN DEFAULT FALSE,
  requires_masters BOOLEAN DEFAULT FALSE,
  requires_phd BOOLEAN DEFAULT FALSE,
  skills_requirements TEXT,
  description TEXT,
  embedding VECTOR(1024),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '60 days')
);

-- Applications from applicants to jobs
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'shortlisted', 'rejected')),
  match_score FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, applicant_id)
);

-- Rejected jobs (swipe left) - to never show again
CREATE TABLE IF NOT EXISTS public.rejected_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, job_id)
);

-- AI insights usage tracking (once per day)
CREATE TABLE IF NOT EXISTS public.ai_insights_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  used_at DATE DEFAULT CURRENT_DATE,
  UNIQUE(user_id, used_at)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rejected_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights_usage ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Resumes policies
CREATE POLICY "resumes_select_own" ON public.resumes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "resumes_insert_own" ON public.resumes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "resumes_update_own" ON public.resumes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "resumes_delete_own" ON public.resumes FOR DELETE USING (auth.uid() = user_id);

-- Recruiters can view resumes for their job applicants
CREATE POLICY "resumes_select_for_recruiters" ON public.resumes FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.applications a
    JOIN public.jobs j ON a.job_id = j.id
    WHERE a.resume_id = resumes.id AND j.recruiter_id = auth.uid()
  )
);

-- Education policies
CREATE POLICY "education_select_own" ON public.education FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.resumes r WHERE r.id = education.resume_id AND r.user_id = auth.uid()));
CREATE POLICY "education_insert_own" ON public.education FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.resumes r WHERE r.id = education.resume_id AND r.user_id = auth.uid()));
CREATE POLICY "education_update_own" ON public.education FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.resumes r WHERE r.id = education.resume_id AND r.user_id = auth.uid()));
CREATE POLICY "education_delete_own" ON public.education FOR DELETE 
USING (EXISTS (SELECT 1 FROM public.resumes r WHERE r.id = education.resume_id AND r.user_id = auth.uid()));

-- Recruiters can view education for their job applicants
CREATE POLICY "education_select_for_recruiters" ON public.education FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.applications a
    JOIN public.jobs j ON a.job_id = j.id
    JOIN public.resumes r ON a.resume_id = r.id
    WHERE r.id = education.resume_id AND j.recruiter_id = auth.uid()
  )
);

-- Work experience policies
CREATE POLICY "work_experience_select_own" ON public.work_experience FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.resumes r WHERE r.id = work_experience.resume_id AND r.user_id = auth.uid()));
CREATE POLICY "work_experience_insert_own" ON public.work_experience FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.resumes r WHERE r.id = work_experience.resume_id AND r.user_id = auth.uid()));
CREATE POLICY "work_experience_update_own" ON public.work_experience FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.resumes r WHERE r.id = work_experience.resume_id AND r.user_id = auth.uid()));
CREATE POLICY "work_experience_delete_own" ON public.work_experience FOR DELETE 
USING (EXISTS (SELECT 1 FROM public.resumes r WHERE r.id = work_experience.resume_id AND r.user_id = auth.uid()));

-- Recruiters can view work experience for their job applicants
CREATE POLICY "work_experience_select_for_recruiters" ON public.work_experience FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.applications a
    JOIN public.jobs j ON a.job_id = j.id
    JOIN public.resumes r ON a.resume_id = r.id
    WHERE r.id = work_experience.resume_id AND j.recruiter_id = auth.uid()
  )
);

-- Jobs policies - everyone can view active jobs
CREATE POLICY "jobs_select_all_active" ON public.jobs FOR SELECT USING (is_active = TRUE);
CREATE POLICY "jobs_select_own" ON public.jobs FOR SELECT USING (recruiter_id = auth.uid());
CREATE POLICY "jobs_insert_own" ON public.jobs FOR INSERT WITH CHECK (recruiter_id = auth.uid());
CREATE POLICY "jobs_update_own" ON public.jobs FOR UPDATE USING (recruiter_id = auth.uid());
CREATE POLICY "jobs_delete_own" ON public.jobs FOR DELETE USING (recruiter_id = auth.uid());

-- Applications policies
CREATE POLICY "applications_select_own" ON public.applications FOR SELECT 
USING (applicant_id = auth.uid() OR EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = applications.job_id AND j.recruiter_id = auth.uid()));
CREATE POLICY "applications_insert_own" ON public.applications FOR INSERT WITH CHECK (applicant_id = auth.uid());
CREATE POLICY "applications_update_recruiter" ON public.applications FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = applications.job_id AND j.recruiter_id = auth.uid()));

-- Rejected jobs policies
CREATE POLICY "rejected_jobs_select_own" ON public.rejected_jobs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "rejected_jobs_insert_own" ON public.rejected_jobs FOR INSERT WITH CHECK (user_id = auth.uid());

-- AI insights usage policies
CREATE POLICY "ai_insights_select_own" ON public.ai_insights_usage FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "ai_insights_insert_own" ON public.ai_insights_usage FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS resumes_embedding_idx ON public.resumes USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS jobs_embedding_idx ON public.jobs USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Function to match jobs to resume using cosine similarity
CREATE OR REPLACE FUNCTION match_jobs_to_resume(
  resume_embedding VECTOR(1024),
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  experience_needed TEXT,
  salary_min INTEGER,
  salary_max INTEGER,
  location_city TEXT,
  location_state TEXT,
  location_country TEXT,
  requires_bachelors BOOLEAN,
  requires_masters BOOLEAN,
  requires_phd BOOLEAN,
  skills_requirements TEXT,
  description TEXT,
  recruiter_id UUID,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    j.id,
    j.title,
    j.experience_needed,
    j.salary_min,
    j.salary_max,
    j.location_city,
    j.location_state,
    j.location_country,
    j.requires_bachelors,
    j.requires_masters,
    j.requires_phd,
    j.skills_requirements,
    j.description,
    j.recruiter_id,
    1 - (j.embedding <=> resume_embedding) AS similarity
  FROM public.jobs j
  WHERE j.is_active = TRUE
    AND j.embedding IS NOT NULL
    AND 1 - (j.embedding <=> resume_embedding) > match_threshold
  ORDER BY j.embedding <=> resume_embedding
  LIMIT match_count;
END;
$$;

-- Function to match resumes to job using cosine similarity
CREATE OR REPLACE FUNCTION match_resumes_to_job(
  job_embedding VECTOR(1024),
  match_threshold FLOAT DEFAULT 0.3,
  match_count INT DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  name TEXT,
  email TEXT,
  whatsapp TEXT,
  skills_strengths TEXT,
  experience TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.user_id,
    r.name,
    r.email,
    r.whatsapp,
    r.skills_strengths,
    r.experience,
    1 - (r.embedding <=> job_embedding) AS similarity
  FROM public.resumes r
  WHERE r.embedding IS NOT NULL
    AND 1 - (r.embedding <=> job_embedding) > match_threshold
  ORDER BY r.embedding <=> job_embedding
  LIMIT match_count;
END;
$$;
