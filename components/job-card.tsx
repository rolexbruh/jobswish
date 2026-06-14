'use client'

import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, DollarSign, Briefcase, GraduationCap, X, Heart } from 'lucide-react'
import type { Job } from '@/lib/types'

interface JobCardProps {
  job: Job
  onSwipe: (direction: 'left' | 'right') => void
  isTop?: boolean
}

export function JobCard({ job, onSwipe, isTop = false }: JobCardProps) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-15, 15])
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5])
  
  const leftIndicatorOpacity = useTransform(x, [-100, 0], [1, 0])
  const rightIndicatorOpacity = useTransform(x, [0, 100], [0, 1])

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > 100) {
      onSwipe('right')
    } else if (info.offset.x < -100) {
      onSwipe('left')
    }
  }

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return null
    const format = (n: number) => `$${(n / 1000).toFixed(0)}k`
    if (min && max) return `${format(min)} - ${format(max)}`
    if (min) return `From ${format(min)}`
    if (max) return `Up to ${format(max)}`
    return null
  }

  const salary = formatSalary(job.salary_min, job.salary_max)

  return (
    <motion.div
      className={`absolute inset-0 ${isTop ? 'z-10' : 'z-0'}`}
      style={{ x, rotate, opacity }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      initial={isTop ? { scale: 1 } : { scale: 0.95 }}
      animate={isTop ? { scale: 1 } : { scale: 0.95 }}
      exit={{ 
        x: x.get() > 0 ? 300 : -300,
        opacity: 0,
        transition: { duration: 0.2 }
      }}
    >
      <Card className="h-full overflow-hidden cursor-grab active:cursor-grabbing select-none">
        {/* Swipe indicators */}
        <motion.div 
          className="absolute top-6 left-6 z-20 p-3 rounded-full bg-destructive/90 border-4 border-destructive"
          style={{ opacity: leftIndicatorOpacity }}
        >
          <X className="h-8 w-8 text-destructive-foreground" />
        </motion.div>
        <motion.div 
          className="absolute top-6 right-6 z-20 p-3 rounded-full bg-green-500/90 border-4 border-green-500"
          style={{ opacity: rightIndicatorOpacity }}
        >
          <Heart className="h-8 w-8 text-white" />
        </motion.div>

        <CardContent className="p-6 h-full flex flex-col">
          <div className="flex-1 space-y-4">
            {/* Job Title */}
            <div>
              <h2 className="text-2xl font-bold text-balance">{job.title}</h2>
              {job.location_city && (
                <div className="flex items-center gap-1 text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">
                    {[job.location_city, job.location_state, job.location_country]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                </div>
              )}
            </div>

            {/* Quick Info */}
            <div className="flex flex-wrap gap-2">
              {salary && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {salary}
                </Badge>
              )}
              {job.experience_needed && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  {job.experience_needed}
                </Badge>
              )}
              {(job.requires_bachelors || job.requires_masters || job.requires_phd) && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <GraduationCap className="h-3 w-3" />
                  {job.requires_phd ? 'PhD' : job.requires_masters ? 'Masters' : 'Bachelors'}
                </Badge>
              )}
            </div>

            {/* Description */}
            {job.description && (
              <div className="flex-1 overflow-y-auto">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  About the role
                </h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {job.description}
                </p>
              </div>
            )}

            {/* Skills */}
            {job.skills_requirements && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Required Skills
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {job.skills_requirements.split(',').map((skill, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {skill.trim()}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Swipe hint */}
          {isTop && (
            <div className="pt-4 text-center text-sm text-muted-foreground">
              Swipe right to apply, left to skip
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
