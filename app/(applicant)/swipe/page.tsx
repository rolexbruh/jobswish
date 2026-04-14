import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SwipeInterface } from '@/components/swipe-interface'
import type { Profile, Resume } from '@/lib/types'

export default async function SwipePage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<Profile>()

  if (!profile || profile.role !== 'applicant') {
    redirect('/dashboard')
  }

  const { data: resume } = await supabase
    .from('resumes')
    .select('*')
    .eq('user_id', user.id)
    .single<Resume>()

  return (
    <div className="h-[calc(100vh-4rem)]">
      <SwipeInterface userId={user.id} resume={resume} />
    </div>
  )
}
