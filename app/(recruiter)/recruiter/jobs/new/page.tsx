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
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

export default function NewJobPage() {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Job fields
  const [title, setTitle] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [description, setDescription] = useState('')
  const [experienceNeeded, setExperienceNeeded] = useState('')
  const [salaryMin, setSalaryMin] = useState('')
  const [salaryMax, setSalaryMax] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [country, setCountry] = useState('')
  const [skillsRequirements, setSkillsRequirements] = useState('')
  const [requiresBachelors, setRequiresBachelors] = useState(false)
  const [requiresMasters, setRequiresMasters] = useState(false)
  const [requiresPhd, setRequiresPhd] = useState(false)

  const handleMastersChange = (checked: boolean) => {
    setRequiresMasters(checked)
    if (checked) {
      setRequiresBachelors(true)
    }
  }

  const handlePhDChange = (checked: boolean) => {
    setRequiresPhd(checked)
    if (checked) {
      setRequiresBachelors(true)
      setRequiresMasters(true)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) {
      setError('Job title is required')
      return
    }

    setSaving(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }

    const { error } = await supabase.from('jobs').insert({
      recruiter_id: user.id,
      title,
      company_name: companyName || null,
      description,
      experience_needed: experienceNeeded || null,
      salary_min: salaryMin ? parseInt(salaryMin) : null,
      salary_max: salaryMax ? parseInt(salaryMax) : null,
      location_city: city || null,
      location_state: state || null,
      location_country: country || null,
      skills_requirements: skillsRequirements || null,
      requires_bachelors: requiresBachelors,
      requires_masters: requiresMasters,
      requires_phd: requiresPhd,
      is_active: true
    })

    if (error) {
      setError(error.message)
      setSaving(false)
      return
    }

    router.push('/recruiter')
    router.refresh()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link href="/recruiter" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <h1 className="text-2xl font-bold mb-6">Post a New Job</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
            <CardDescription>Basic information about the position</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel>Job Title *</FieldLabel>
                <Input 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="Senior Software Engineer"
                />
              </Field>
              <Field>
                <FieldLabel>Company Name</FieldLabel>
                <Input 
                  value={companyName} 
                  onChange={(e) => setCompanyName(e.target.value)} 
                  placeholder="Your Company"
                />
              </Field>
              <Field>
                <FieldLabel>Description</FieldLabel>
                <Textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Describe the role, responsibilities, and what you're looking for..."
                  rows={5}
                />
              </Field>
              <Field>
                <FieldLabel>Required Skills</FieldLabel>
                <Input 
                  value={skillsRequirements} 
                  onChange={(e) => setSkillsRequirements(e.target.value)} 
                  placeholder="React, TypeScript, Node.js (comma separated)"
                />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Experience & Education */}
        <Card>
          <CardHeader>
            <CardTitle>Requirements</CardTitle>
            <CardDescription>Experience and education requirements</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel>Experience Level</FieldLabel>
                <Select value={experienceNeeded} onValueChange={setExperienceNeeded}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Entry Level (0-1 years)">Entry Level (0-1 years)</SelectItem>
                    <SelectItem value="Junior (1-3 years)">Junior (1-3 years)</SelectItem>
                    <SelectItem value="Mid-Level (3-5 years)">Mid-Level (3-5 years)</SelectItem>
                    <SelectItem value="Senior (5-10 years)">Senior (5-10 years)</SelectItem>
                    <SelectItem value="Lead (10+ years)">Lead (10+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <div className="space-y-3">
                <p className="text-sm font-medium">Education Requirements</p>
                <div className="flex items-center gap-3">
                  <Switch checked={requiresBachelors} onCheckedChange={setRequiresBachelors} />
                  <span className="text-sm">Bachelor&apos;s degree required</span>
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={requiresMasters} onCheckedChange={handleMastersChange} />
                  <span className="text-sm">Master&apos;s degree required</span>
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={requiresPhd} onCheckedChange={handlePhDChange} />
                  <span className="text-sm">PhD required</span>
                </div>
              </div>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Location & Salary */}
        <Card>
          <CardHeader>
            <CardTitle>Location & Compensation</CardTitle>
            <CardDescription>Where is the job and what does it pay?</CardDescription>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Minimum Salary (USD)</FieldLabel>
                  <Input 
                    type="number" 
                    value={salaryMin} 
                    onChange={(e) => setSalaryMin(e.target.value)} 
                    placeholder="80000"
                  />
                </Field>
                <Field>
                  <FieldLabel>Maximum Salary (USD)</FieldLabel>
                  <Input 
                    type="number" 
                    value={salaryMax} 
                    onChange={(e) => setSalaryMax(e.target.value)} 
                    placeholder="120000"
                  />
                </Field>
              </div>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-between">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="ml-auto">
            <Button type="submit" disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Posting...' : 'Post Job'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
