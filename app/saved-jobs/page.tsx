// app/saved-jobs/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Heart, Trash2, ExternalLink, Building, MapPin, 
  DollarSign, Clock, Briefcase, Loader2, BookmarkX
} from 'lucide-react'
import Link from 'next/link';
import { JobCard } from '@/components/job-card';
import { apiClient, type SavedJob, type Job } from '@/lib/api'

interface SavedJobWithDetails extends SavedJob {
  job_details?: Job
}

export default function SavedJobsPage() {
  const router = useRouter()
  const [savedJobs, setSavedJobs] = useState<SavedJobWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  

  useEffect(() => {
    // Check authentication
    if (!apiClient.isAuthenticated()) {
      router.push('/login')
      return
    }

    fetchSavedJobs()
  }, [router])

  const fetchSavedJobs = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getSavedJobs()

      if (response.data) {
        const jobs = response.data.results || []
        
        // For each saved job, we need to fetch the job details
        // In a real app, this would ideally be done by the backend API
        const jobsWithDetails = await Promise.all(
          jobs.map(async (savedJob) => {
            try {
              // The API's getJob function expects a string ID, but savedJob.job is a number.
              // This is a temporary workaround. In a real app, the API or the data model should be consistent.
              const jobResponse = await apiClient.getJob(String(savedJob.job));
              return {
                ...savedJob,
                job_details: jobResponse.data
              }
            } catch (error) {
              console.error(`Error fetching details for job ${savedJob.job}:`, error)
              return { ...savedJob, job_details: undefined }
            }
          })
        )

        setSavedJobs(jobsWithDetails.filter(job => job.job_details)) // Only show jobs with details
      } else if (response.status === 401 || response.status === 403) {
        router.push('/login')
      } else {
        setError('Failed to load saved jobs')
      }
    } catch (error) {
      setError('Network error occurred')
      console.error('Error fetching saved jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  

  

  if (!apiClient.isAuthenticated()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Saved Jobs</h1>
          <p className="text-gray-600">
            Jobs you've saved for later review and application
          </p>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Loading saved jobs...</span>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              {error}
              <Button variant="outline" size="sm" onClick={fetchSavedJobs} className="ml-4">
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {!loading && !error && (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                {savedJobs.length} saved job{savedJobs.length !== 1 ? 's' : ''}
              </p>
              {savedJobs.length > 0 && (
                <Button variant="outline" onClick={fetchSavedJobs}>
                  Refresh
                </Button>
              )}
            </div>

            {savedJobs.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <BookmarkX className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800">No Saved Jobs</h3>
                  <p className="text-gray-500 mt-2">You haven't saved any jobs yet. Start exploring and save jobs to view them here.</p>
                  <Button asChild className="mt-6">
                    <Link href="/">Find Jobs</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {savedJobs.map((savedJob) => (
                  savedJob.job_details && (
                    <JobCard 
                      key={savedJob.id} 
                      job={savedJob.job_details} 
                      onUnsave={() => setSavedJobs(prev => prev.filter(j => j.id !== savedJob.id))}
                      isSavedInitially={true}
                      savedJobId={savedJob.id}
                    />
                  )
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}