'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2, Save, GraduationCap, Briefcase } from 'lucide-react'
import type { Resume, Education, WorkExperience } from '@/lib/types'

interface ResumeBuilderProps {
  userId: string
  initialResume: Resume | null
  initialEducation: Education[]
  initialWorkExperience: WorkExperience[]
}

export function ResumeBuilder({ 
  userId, 
  initialResume, 
  initialEducation, 
  initialWorkExperience 
}: ResumeBuilderProps) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Resume fields
  const [name, setName] = useState(initialResume?.name || '')
  const [email, setEmail] = useState(initialResume?.email || '')
  const [whatsapp, setWhatsapp] = useState(initialResume?.whatsapp || '')
  const [githubLink, setGithubLink] = useState(initialResume?.github_link || '')
  const [experience, setExperience] = useState(initialResume?.experience || '')
  const [skillsStrengths, setSkillsStrengths] = useState(initialResume?.skills_strengths || '')
  const [projectLinks, setProjectLinks] = useState(initialResume?.project_links || '')
  const [city, setCity] = useState(initialResume?.city || '')
  const [state, setState] = useState(initialResume?.state || '')
  const [country, setCountry] = useState(initialResume?.country || '')
  const [showJobsOnlyInCity, setShowJobsOnlyInCity] = useState(initialResume?.show_jobs_only_in_city || false)

  // Education
  const [education, setEducation] = useState<Partial<Education>[]>(
    initialEducation.length > 0 ? initialEducation : [{ type: 'bachelors', degree_name: '' }]
  )

  // Work experience
  const [workExperience, setWorkExperience] = useState<Partial<WorkExperience>[]>(
    initialWorkExperience.length > 0 ? initialWorkExperience : [{ role: '', company_name: '' }]
  )

  const addEducation = () => {
    setEducation([...education, { type: 'bachelors', degree_name: '' }])
  }

  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index))
  }

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const updated = [...education]
    updated[index] = { ...updated[index], [field]: value }
    setEducation(updated)
  }

  const addWorkExperience = () => {
    setWorkExperience([...workExperience, { role: '', company_name: '' }])
  }

  const removeWorkExperience = (index: number) => {
    setWorkExperience(workExperience.filter((_, i) => i !== index))
  }

  const updateWorkExperience = (index: number, field: keyof WorkExperience, value: string) => {
    const updated = [...workExperience]
    updated[index] = { ...updated[index], [field]: value }
    setWorkExperience(updated)
  }

  const handleSave = async () => {
    if (!name || !email) {
      setError('Name and email are required')
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      let resumeId = initialResume?.id

      // Upsert resume
      if (resumeId) {
        const { error } = await supabase
          .from('resumes')
          .update({
            name, email, whatsapp, github_link: githubLink, experience,
            skills_strengths: skillsStrengths, project_links: projectLinks,
            city, state, country, show_jobs_only_in_city: showJobsOnlyInCity,
            updated_at: new Date().toISOString()
          })
          .eq('id', resumeId)
        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from('resumes')
          .insert({
            user_id: userId, name, email, whatsapp, github_link: githubLink,
            experience, skills_strengths: skillsStrengths, project_links: projectLinks,
            city, state, country, show_jobs_only_in_city: showJobsOnlyInCity
          })
          .select()
          .single()
        if (error) throw error
        resumeId = data.id
      }

      // Delete existing education and work experience
      await Promise.all([
        supabase.from('education').delete().eq('resume_id', resumeId),
        supabase.from('work_experience').delete().eq('resume_id', resumeId)
      ])

      // Insert new education entries
      const validEducation = education.filter(e => e.degree_name)
      if (validEducation.length > 0) {
        await supabase.from('education').insert(
          validEducation.map(e => ({
            resume_id: resumeId,
            type: e.type,
            degree_name: e.degree_name,
            certificate_url: e.certificate_url
          }))
        )
      }

      // Insert new work experience entries
      const validWorkExp = workExperience.filter(w => w.role && w.company_name)
      if (validWorkExp.length > 0) {
        await supabase.from('work_experience').insert(
          validWorkExp.map(w => ({
            resume_id: resumeId,
            role: w.role,
            company_name: w.company_name
          }))
        )
      }

      setSuccess(true)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Your contact details and personal info</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Full Name *</FieldLabel>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
              </Field>
              <Field>
                <FieldLabel>Email *</FieldLabel>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" />
              </Field>
              <Field>
                <FieldLabel>WhatsApp</FieldLabel>
                <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+1 234 567 8900" />
              </Field>
              <Field>
                <FieldLabel>GitHub Profile</FieldLabel>
                <Input value={githubLink} onChange={(e) => setGithubLink(e.target.value)} placeholder="https://github.com/username" />
              </Field>
            </div>
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
          <CardDescription>Where are you based?</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field>
                <FieldLabel>City</FieldLabel>
                <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="San Francisco" />
              </Field>
              <Field>
                <FieldLabel>State</FieldLabel>
                <Input value={state} onChange={(e) => setState(e.target.value)} placeholder="CA" />
              </Field>
              <Field>
                <FieldLabel>Country</FieldLabel>
                <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="USA" />
              </Field>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={showJobsOnlyInCity} onCheckedChange={setShowJobsOnlyInCity} />
              <span className="text-sm">Only show jobs in my city</span>
            </div>
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Experience & Skills */}
      <Card>
        <CardHeader>
          <CardTitle>Experience & Skills</CardTitle>
          <CardDescription>Tell recruiters about your background</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel>Years of Experience</FieldLabel>
              <Select value={experience} onValueChange={setExperience}>
                <SelectTrigger>
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-1">0-1 years</SelectItem>
                  <SelectItem value="1-3">1-3 years</SelectItem>
                  <SelectItem value="3-5">3-5 years</SelectItem>
                  <SelectItem value="5-10">5-10 years</SelectItem>
                  <SelectItem value="10+">10+ years</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Skills & Strengths</FieldLabel>
              <Textarea 
                value={skillsStrengths} 
                onChange={(e) => setSkillsStrengths(e.target.value)} 
                placeholder="React, TypeScript, Node.js, AWS..."
                rows={3}
              />
            </Field>
            <Field>
              <FieldLabel>Project Links</FieldLabel>
              <Textarea 
                value={projectLinks} 
                onChange={(e) => setProjectLinks(e.target.value)} 
                placeholder="Portfolio, projects, case studies..."
                rows={2}
              />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Education
              </CardTitle>
              <CardDescription>Your academic background</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={addEducation}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {education.map((edu, index) => (
              <div key={index} className="p-4 border border-border rounded-lg space-y-3">
                <div className="flex items-start justify-between">
                  <span className="text-sm font-medium">Education {index + 1}</span>
                  {education.length > 1 && (
                    <Button variant="ghost" size="sm" onClick={() => removeEducation(index)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Select value={edu.type || ''} onValueChange={(v) => updateEducation(index, 'type', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Degree type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bachelors">Bachelor&apos;s</SelectItem>
                      <SelectItem value="masters">Master&apos;s</SelectItem>
                      <SelectItem value="phd">PhD</SelectItem>
                      <SelectItem value="certification">Certification</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input 
                    value={edu.degree_name || ''} 
                    onChange={(e) => updateEducation(index, 'degree_name', e.target.value)}
                    placeholder="Degree / Certificate name"
                  />
                </div>
                <Input 
                  value={edu.certificate_url || ''} 
                  onChange={(e) => updateEducation(index, 'certificate_url', e.target.value)}
                  placeholder="Certificate URL (optional)"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Work Experience */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Work Experience
              </CardTitle>
              <CardDescription>Previous roles and companies</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={addWorkExperience}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workExperience.map((work, index) => (
              <div key={index} className="p-4 border border-border rounded-lg space-y-3">
                <div className="flex items-start justify-between">
                  <span className="text-sm font-medium">Experience {index + 1}</span>
                  {workExperience.length > 1 && (
                    <Button variant="ghost" size="sm" onClick={() => removeWorkExperience(index)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input 
                    value={work.role || ''} 
                    onChange={(e) => updateWorkExperience(index, 'role', e.target.value)}
                    placeholder="Job title"
                  />
                  <Input 
                    value={work.company_name || ''} 
                    onChange={(e) => updateWorkExperience(index, 'company_name', e.target.value)}
                    placeholder="Company name"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex items-center justify-between">
        <div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-green-500">Profile saved successfully!</p>}
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>
    </div>
  )
}
