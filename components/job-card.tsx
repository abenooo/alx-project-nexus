'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Clock, DollarSign, Building, Heart } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { apiClient, Job } from '@/lib/api'

export interface JobCardProps {
  job: Job;
  isSavedInitially?: boolean;
  savedJobId?: number;
  onUnsave?: (jobId: string) => void;
}

export function JobCard({ job, isSavedInitially = false, savedJobId, onUnsave }: JobCardProps) {
  const [isSaved, setIsSaved] = useState(isSavedInitially);
  const [currentSavedJobId, setCurrentSavedJobId] = useState(savedJobId);
  const [saving, setSaving] = useState(false);
  const [formattedDate, setFormattedDate] = useState('');

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

  useEffect(() => {
    setFormattedDate(formatDate(job.createdAt))
  }, [job.createdAt])

  const handleToggleSave = async () => {
    if (!apiClient.isAuthenticated()) {
      window.location.href = '/login';
      return;
    }

    setSaving(true);
    try {
      if (isSaved) {
        if (currentSavedJobId) {
          const response = await apiClient.unsaveJob(currentSavedJobId);
          if (response.status === 204 || !response.error) {
            setIsSaved(false);
            if (onUnsave) {
              onUnsave(job._id);
            }
          } else {
            console.error('Failed to unsave job:', response.error);
          }
        }
      } else {
        const response = await apiClient.saveJob(job._id);
        if (response.data) {
          setIsSaved(true);
          setCurrentSavedJobId(response.data.id);
        } else {
          console.error('Failed to save job:', response.error);
        }
      }
    } catch (error) {
      console.error('Error toggling save state:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <Link href={`/jobs/${job._id}`} className="hover:underline">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {job.title}
              </h3>
            </Link>
            <div className="flex items-center text-gray-600 mb-2">
              <Building className="h-4 w-4 mr-2" />
              <span className="font-medium">{job.company}</span>
            </div>
            <div className="flex items-center text-gray-500 text-sm">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{`${job.region}, ${job.country}`}</span>
              <Clock className="h-4 w-4 ml-4 mr-1" />
              <span>{formatDate(job.createdAt)}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleSave}
            disabled={saving}
            className="text-gray-400 hover:text-red-500"
          >
            <Heart className={`h-5 w-5 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary">{job.jobType}</Badge>
          <Badge variant="outline">{job.category}</Badge>
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
              <Link href={`/jobs/${job._id}`}>
                View Details
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href={`/jobs/${job._id}/apply`}>
                Apply Now
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
