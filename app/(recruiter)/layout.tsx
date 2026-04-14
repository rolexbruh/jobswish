import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { RecruiterNav } from '@/components/recruiter-nav'

export default async function RecruiterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <RecruiterNav />
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
