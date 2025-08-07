'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Clock, DollarSign, Building, Heart } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { apiClient } from '@/lib/api'

interface Job {
  id: number
  title: string
  company_name: string
  location: string
  salary: string
  job_type: string
  description: string
  posted_at: string
  category_name: string
  industry: string
}

interface JobCardProps {
  job: Job
}

export function JobCard({ job }: JobCardProps) {
  const [isSaved, setIsSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return '1 day ago'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    return `${Math.ceil(diffDays / 30)} months ago`
  }

  const handleSaveJob = async () => {
    // Check if user is authenticated
    if (!apiClient.isAuthenticated()) {
      // Redirect to login or show login modal
      window.location.href = '/login'
      return
    }

    setSaving(true)
    try {
      const response = await apiClient.saveJob(job.id)
      
      if (response.data) {
        setIsSaved(true)
      } else if (response.status === 401 || response.status === 403) {
        // Redirect to login if not authenticated
        window.location.href = '/login'
      } else {
        console.error('Failed to save job:', response.error)
      }
    } catch (error) {
      console.error('Error saving job:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <Link href={`/jobs/${job.id}`} className="hover:underline">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {job.title}
              </h3>
            </Link>
            <div className="flex items-center text-gray-600 mb-2">
              <Building className="h-4 w-4 mr-2" />
              <span className="font-medium">{job.company_name}</span>
            </div>
            <div className="flex items-center text-gray-500 text-sm">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{job.location}</span>
              <Clock className="h-4 w-4 ml-4 mr-1" />
              <span>{formatDate(job.posted_at)}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSaveJob}
            disabled={saving}
            className="text-gray-400 hover:text-red-500"
          >
            <Heart className={`h-5 w-5 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary">{job.job_type}</Badge>
          <Badge variant="outline">{job.category_name}</Badge>
          <Badge variant="outline">{job.industry}</Badge>
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-2">
          {job.description}
        </p>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center text-green-600 font-semibold">
            <DollarSign className="h-4 w-4 mr-1" />
            <span>{job.salary}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/jobs/${job.id}`}>
                View Details
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href={`/jobs/${job.id}/apply`}>
                Apply Now
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
