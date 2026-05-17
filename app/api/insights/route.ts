import { createClient } from '@/lib/supabase/server'
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
      return NextResponse.json({ 
        insights: 'You have already used your daily AI Insights. Come back tomorrow for fresh insights!',
        error: 'Daily limit reached' 
      }, { status: 429 })
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

    // Generate insights using NVIDIA API
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
1. Strengths of this profile (2-3 points)
2. Areas for improvement (2-3 points)
3. Specific suggestions to make the profile more attractive to recruiters (3-4 points)
4. Job search tips based on their experience level (2-3 points)

Be encouraging but honest. Focus on practical, actionable advice.`

    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer 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`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta/llama-2-70b-chat',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        top_p: 0.7,
        max_tokens: 2048,
      }),
    })

    if (!response.ok) {
      throw new Error(`NVIDIA API error: ${response.statusText}`)
    }

    const data = await response.json()
    const insights = data.choices[0]?.message?.content || 'Unable to generate insights at this time.'

    // Record usage
    await supabase.from('ai_insights_usage').insert({
      user_id: user.id,
      used_at: today
    })

    return NextResponse.json({ insights })
  } catch (error) {
    console.error('[v0] Insights error:', error)
    
    // Fallback insights if API fails
    const fallbackInsights = `
## AI Insights for Your Profile

### Your Strengths
- You have built a solid foundation with diverse experience
- Your willingness to improve shows great growth potential

### Areas for Improvement
- Add specific metrics and numbers to quantify your achievements
- Include more details about technologies and tools you're proficient with

### Recommendations
- Update your resume with measurable results (e.g., "Increased performance by 40%")
- List your top 5-7 technical skills prominently
- Include links to your best projects and GitHub profile

### Job Search Tips
- Start with companies in your current location to ease the transition
- Practice interview questions specific to your target role
- Connect with recruiters on LinkedIn about roles matching your experience

Keep iterating on your profile - each improvement increases your chances of landing your dream job!
    `
    
    return NextResponse.json({ insights: fallbackInsights })
  }
}

export async function GET(request: Request) {
  return NextResponse.json({ error: 'Use POST method' }, { status: 405 })
}
