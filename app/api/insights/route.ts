import { createClient } from '@/lib/supabase/server'
import { streamText } from 'ai'
import { NextResponse } from 'next/server'
import type { Resume, Education, WorkExperience } from '@/lib/types'

export async function POST(request: Request) {
  try {
    const { resumeId } = await request.json()
    
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if already used today
    const today = new Date().toISOString().split('T')[0]
    const { data: usage } = await supabase
      .from('ai_insights_usage')
      .select('*')
      .eq('user_id', user.id)
      .eq('used_at', today)

    if (usage && usage.length > 0) {
      return NextResponse.json({ error: 'Daily limit reached' }, { status: 429 })
    }

    // Fetch resume data
    const { data: resume } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .eq('user_id', user.id)
      .single<Resume>()

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
    }

    const [eduResult, workResult] = await Promise.all([
      supabase.from('education').select('*').eq('resume_id', resumeId),
      supabase.from('work_experience').select('*').eq('resume_id', resumeId)
    ])

    const education = (eduResult.data || []) as Education[]
    const workExperience = (workResult.data || []) as WorkExperience[]

    // Record usage
    await supabase.from('ai_insights_usage').insert({
      user_id: user.id,
      used_at: today
    })

    // Generate insights
    const prompt = `Analyze this job seeker's profile and provide 5-7 specific, actionable suggestions to improve their chances of getting hired.

Profile:
- Name: ${resume.name}
- Experience Level: ${resume.experience || 'Not specified'}
- Skills: ${resume.skills_strengths || 'Not specified'}
- Location: ${[resume.city, resume.state, resume.country].filter(Boolean).join(', ') || 'Not specified'}
- Education: ${education.map(e => `${e.type}: ${e.degree_name}`).join(', ') || 'Not specified'}
- Work History: ${workExperience.map(w => `${w.role} at ${w.company_name}`).join(', ') || 'Not specified'}
- Project Links: ${resume.project_links || 'None'}
- GitHub: ${resume.github_link || 'None'}

Please provide:
1. Strengths of this profile
2. Areas for improvement
3. Specific suggestions to make the profile more attractive to recruiters
4. Tips for the job search based on their experience level

Be encouraging but honest. Focus on practical, actionable advice.`

    const result = streamText({
      model: 'openai/gpt-4o-mini',
      prompt,
    })

    // Collect the full response
    let insights = ''
    for await (const chunk of result.textStream) {
      insights += chunk
    }

    return NextResponse.json({ insights })
  } catch (error) {
    console.error('Insights error:', error)
    return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 })
  }
}
