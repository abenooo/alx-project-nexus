'use client'

import { useEffect, useState } from 'react'
import { JobCard } from '@/components/job-card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Wifi, WifiOff, Info } from 'lucide-react'
import { apiClient, Job } from '@/lib/api'
import Link from 'next/link'

export function JobListImproved() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isUsingFallback, setIsUsingFallback] = useState(false)

  const fetchJobs = async (pageNum: number = 1) => {
    console.log(`Fetching jobs for page ${pageNum}`)
    setLoading(true)
    setError(null)
    
    // This should never throw an error now
    const response = await apiClient.getJobs(pageNum)
    
    console.log('Jobs response received:', response)
    
    if (response.data) {
      const jobsArray = response.data.results || []
      
      if (pageNum === 1) {
        setJobs(jobsArray)
      } else {
        setJobs(prev => [...prev, ...jobsArray])
      }
      
      setHasMore(!!response.data.next)
      setIsUsingFallback(!!response.isFromFallback)
      
      if (response.isFromFallback) {
        setError('Showing sample jobs. Sign in to see all available positions and access full features.')
      }
    } else {
      // This should rarely happen now, but just in case
      setError('Unable to load jobs. Please try again.')
    }
    
    setLoading(false)
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  const loadMore = () => {
    if (!isUsingFallback) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchJobs(nextPage)
    }
  }

  const retry = () => {
    setPage(1)
    setJobs([])
    fetchJobs(1)
  }

  if (loading && jobs.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading jobs...</span>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Latest Jobs</h2>
          {isUsingFallback ? (
            <div className="flex items-center text-blue-600">
              <Info className="h-4 w-4 mr-1" />
              <span className="text-sm">Sample Data</span>
            </div>
          ) : (
            <div className="flex items-center text-green-600">
              <Wifi className="h-4 w-4 mr-1" />
              <span className="text-sm">Live Data</span>
            </div>
          )}
        </div>
        <span className="text-gray-600">
          {jobs.length} job{jobs.length !== 1 ? 's' : ''} found
          {isUsingFallback && ' (sample)'}
        </span>
      </div>

      {error && (
        <Alert className="mb-6" variant={isUsingFallback ? 'default' : 'destructive'}>
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <div className="flex gap-2">
              {isUsingFallback && (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/login">
                    Sign In
                  </Link>
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={retry}>
                Retry
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid gap-6">
        {jobs.map((job) => (
          <JobCard key={job._id} job={job} />
        ))}
      </div>
      
      {hasMore && !isUsingFallback && (
        <div className="text-center mt-8">
          <Button 
            onClick={loadMore} 
            disabled={loading}
            variant="outline"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More Jobs'
            )}
          </Button>
        </div>
      )}

      {isUsingFallback && (
        <div className="text-center mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <div className="max-w-md mx-auto">
            <Info className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Sign in to see all available jobs
            </h3>
            <p className="text-blue-700 mb-4">
              These are sample job listings. Create an account or sign in to access the complete job database, save jobs, and apply directly to positions.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/register">Create Account</Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {jobs.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No jobs found</p>
          <Button variant="outline" onClick={retry} className="mt-4">
            Refresh
          </Button>
        </div>
      )}
    </div>
  )
}
