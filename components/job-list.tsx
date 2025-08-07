'use client'

import { useEffect, useState } from 'react'
import { JobCard } from '@/components/job-card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

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

export function JobList() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const fetchJobs = async (pageNum: number = 1) => {
    try {
      setLoading(true)
      
      // Add more detailed logging
      console.log(`Fetching jobs from: https://mysite-z2xs.onrender.com/api/jobs/?page=${pageNum}`)
      
      const response = await fetch(`https://mysite-z2xs.onrender.com/api/jobs/?page=${pageNum}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors', // Explicitly set CORS mode
      })
      
      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', errorText)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('API Response data:', data)
      
      // Handle different response formats
      const jobsArray = data.results || data || []
      
      if (pageNum === 1) {
        setJobs(jobsArray)
      } else {
        setJobs(prev => [...prev, ...jobsArray])
      }
      
      setHasMore(!!data.next)
      setError(null)
    } catch (err) {
      console.error('Detailed fetch error:', err)
      
      // Provide more specific error messages
      let errorMessage = 'Failed to load jobs. '
      
      if (err instanceof TypeError && err.message.includes('fetch')) {
        errorMessage += 'Network connection failed. Please check your internet connection.'
      } else if (err instanceof Error) {
        errorMessage += err.message
      } else {
        errorMessage += 'Please try again later.'
      }
      
      setError(errorMessage)
      
      // Set fallback data for development/testing
      if (pageNum === 1 && jobs.length === 0) {
        setJobs([
          {
            id: 1,
            title: "Senior Software Engineer",
            company_name: "Tech Corp",
            location: "San Francisco, CA",
            salary: "$120,000 - $160,000",
            job_type: "full-time",
            description: "We are looking for a senior software engineer to join our team...",
            posted_at: new Date().toISOString(),
            category_name: "Technology",
            industry: "Software"
          },
          {
            id: 2,
            title: "Product Manager",
            company_name: "Innovation Inc",
            location: "New York, NY",
            salary: "$100,000 - $140,000",
            job_type: "full-time",
            description: "Join our product team to drive innovation and growth...",
            posted_at: new Date().toISOString(),
            category_name: "Product",
            industry: "Technology"
          }
        ])
        setHasMore(false)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchJobs(nextPage)
  }

  if (loading && jobs.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading jobs...</span>
      </div>
    )
  }

  if (error && jobs.length === 0) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {error}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fetchJobs()} 
            className="ml-4"
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Latest Jobs</h2>
        <span className="text-gray-600">{jobs.length} jobs found</span>
      </div>
      
      <div className="grid gap-6">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
      
      {hasMore && (
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
    </div>
  )
}
