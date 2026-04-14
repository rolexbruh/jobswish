export interface Profile {
  id: string
  email: string
  role: 'applicant' | 'recruiter' | null
  created_at: string
}

export interface Resume {
  id: string
  user_id: string
  name: string
  email: string
  whatsapp?: string
  github_link?: string
  experience?: string
  skills_strengths?: string
  project_links?: string
  city?: string
  state?: string
  country?: string
  show_jobs_only_in_city: boolean
  created_at: string
  updated_at: string
}

export interface Education {
  id: string
  resume_id: string
  type: 'bachelors' | 'masters' | 'certification' | 'phd'
  degree_name: string
  certificate_url?: string
  created_at: string
}

export interface WorkExperience {
  id: string
  resume_id: string
  role: string
  company_name: string
  created_at: string
}

export interface Job {
  id: string
  recruiter_id: string
  title: string
  experience_needed?: string
  salary_min?: number
  salary_max?: number
  location_city?: string
  location_state?: string
  location_country?: string
  requires_bachelors: boolean
  requires_masters: boolean
  requires_phd: boolean
  skills_requirements?: string
  description?: string
  is_active: boolean
  created_at: string
  expires_at: string
}

export interface Application {
  id: string
  job_id: string
  applicant_id: string
  resume_id: string
  status: 'pending' | 'shortlisted' | 'rejected'
  match_score?: number
  created_at: string
  job?: Job
  resume?: Resume
  applicant?: Profile
}

export interface RejectedJob {
  id: string
  user_id: string
  job_id: string
  created_at: string
}

export interface AIInsightsUsage {
  id: string
  user_id: string
  used_at: string
}

export interface ResumeWithDetails extends Resume {
  education: Education[]
  work_experience: WorkExperience[]
}

export interface ApplicationWithDetails extends Application {
  job: Job
  resume: ResumeWithDetails
}
