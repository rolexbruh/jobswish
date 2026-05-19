'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { MapPin, Clock, Trash2 } from 'lucide-react'
import type { Job } from '@/lib/types'

interface JobWithApplicationCount extends Job {
  applications: { count: number }[]
}

interface JobsListProps {
  jobs: JobWithApplicationCount[]
}

export function JobsList({ jobs }: JobsListProps) {
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleDeleteJob = async () => {
    if (!deleteJobId) return
    
    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', deleteJobId)

      if (error) throw error
      
      setDeleteJobId(null)
      router.refresh()
    } catch (error) {
      console.error('[v0] Delete job error:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="space-y-3">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <Link
                href={`/recruiter/jobs/${job.id}`}
                className="flex-1 min-w-0"
              >
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold truncate hover:text-primary">{job.title}</h3>
                  <Badge variant={job.is_active ? 'default' : 'secondary'}>
                    {job.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  {job.location_city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {job.location_city}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(job.created_at).toLocaleDateString()}
                  </span>
                </div>
              </Link>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-lg font-semibold">{job.applications[0]?.count || 0}</p>
                  <p className="text-xs text-muted-foreground">applicants</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive border-destructive/20 hover:bg-destructive/10"
                  onClick={() => setDeleteJobId(job.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteJobId} onOpenChange={() => setDeleteJobId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Job Posting?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The job posting and all associated data will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteJobId(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteJob}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Job'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
