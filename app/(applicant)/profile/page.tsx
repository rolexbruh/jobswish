import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ResumeBuilder } from '@/components/resume-builder'
import type { Resume, Education, WorkExperience } from '@/lib/types'

export default async function ProfilePage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  const { data: resume } = await supabase
    .from('resumes')
    .select('*')
    .eq('user_id', user.id)
    .single<Resume>()

  let education: Education[] = []
  let workExperience: WorkExperience[] = []

  if (resume) {
    const [eduResult, workResult] = await Promise.all([
      supabase.from('education').select('*').eq('resume_id', resume.id),
      supabase.from('work_experience').select('*').eq('resume_id', resume.id)
    ])
    education = (eduResult.data || []) as Education[]
    workExperience = (workResult.data || []) as WorkExperience[]
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
      <ResumeBuilder 
        userId={user.id}
        initialResume={resume}
        initialEducation={education}
        initialWorkExperience={workExperience}
      />
    </div>
  )
}
