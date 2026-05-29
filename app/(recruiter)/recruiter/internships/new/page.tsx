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

export default function NewInternshipPage() {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Internship fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [collegeYear, setCollegeYear] = useState('')
  const [stipend, setStipend] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [country, setCountry] = useState('')
  const [skillsRequirements, setSkillsRequirements] = useState('')
  const [internshipDegreeType, setInternshipDegreeType] = useState<'undergraduate' | 'postgraduate'>('undergraduate')
  const [internshipDegreeName, setInternshipDegreeName] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) {
      setError('Internship title is required')
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
      description,
      college_year: collegeYear || null,
      stipend: stipend ? parseInt(stipend) : null,
      location_city: city || null,
      location_state: state || null,
      location_country: country || null,
      skills_requirements: skillsRequirements || null,
      internship_degree_type: internshipDegreeType,
      internship_degree_name: internshipDegreeName || null,
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

      <h1 className="text-2xl font-bold mb-6">Post a New Internship</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Internship Details</CardTitle>
            <CardDescription>Basic information about the internship</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel>Internship Title *</FieldLabel>
                <Input 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="Summer Internship - Software Engineering"
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

        {/* Internship Degree Requirements */}
        <Card>
          <CardHeader>
            <CardTitle>Internship Degree Requirements</CardTitle>
            <CardDescription>What degree level is this internship for?</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel>Degree Level</FieldLabel>
                <Select value={internshipDegreeType} onValueChange={(v) => setInternshipDegreeType(v as 'undergraduate' | 'postgraduate')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select degree level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="undergraduate">Undergraduate (Bachelor Only)</SelectItem>
                    <SelectItem value="postgraduate">Postgraduate (Master, PhD)</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Degree Name</FieldLabel>
                <Input 
                  value={internshipDegreeName} 
                  onChange={(e) => setInternshipDegreeName(e.target.value)} 
                  placeholder="e.g., Computer Science, Engineering, Business (optional)"
                />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Location & Stipend */}
        <Card>
          <CardHeader>
            <CardTitle>Location & Stipend</CardTitle>
            <CardDescription>Where is the internship and what is the monthly stipend?</CardDescription>
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
              <Field>
                <FieldLabel>Monthly Stipend (USD)</FieldLabel>
                <Input 
                  type="number" 
                  value={stipend} 
                  onChange={(e) => setStipend(e.target.value)} 
                  placeholder="5000"
                />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-between">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="ml-auto">
            <Button type="submit" disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Posting...' : 'Post Internship'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
