// app/jobs/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  MapPin, Clock, DollarSign, Building, Briefcase, 
  User, Eye, Heart, Share2, ArrowLeft,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import { apiClient, type Job } from '@/lib/api'

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  // Ensure jobId is treated as a string
  const jobId = typeof params.id === 'string' ? params.id : ''
  
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [savingJob, setSavingJob] = useState(false)
  const [applying, setApplying] = useState(false)

  useEffect(() => {
    if (jobId) {
      fetchJob()
    }
  }, [jobId])

  const fetchJob = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getJob(jobId)
      
      if (response.data) {
        setJob(response.data)
      } else {
        setError('Job not found')
      }
    } catch (error) {
      setError('Failed to load job details')
      console.error('Error fetching job:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveJob = async () => {
    if (!apiClient.isAuthenticated()) {
      router.push('/login')
      return
    }

    setSavingJob(true)
    try {
      const response = await apiClient.saveJob(jobId)
      
      if (response.data) {
        setSaved(true)
      } else if (response.status === 401 || response.status === 403) {
        router.push('/login')
      } else {
        console.error('Failed to save job:', response.error)
      }
    } catch (error) {
      console.error('Error saving job:', error)
    } finally {
      setSavingJob(false)
    }
  }

  const handleApply = () => {
    if (!apiClient.isAuthenticated()) {
      router.push('/login')
      return
    }
    
    router.push(`/jobs/${jobId}/apply`)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return '1 day ago'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    return `${Math.ceil(diffDays / 30)} months ago`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg p-6">
                  <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
                  <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/3 mb-6"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-6">
                <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="container mx-auto px-4 text-center">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={() => router.back()} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg text-gray-600">Job not found.</p>
          <Button onClick={() => router.push('/')} className="mt-4">
            Go to Homepage
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Jobs
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl font-bold mb-2">
                      {job.title}
                    </CardTitle>
                    <div className="flex items-center text-lg text-gray-600 mb-3">
                      <Building className="h-5 w-5 mr-2" />
                      <span className="font-medium">{job.company}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{`${job.region}, ${job.country}`}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{getTimeAgo(job.createdAt)}</span>
                      </div>
                      <div className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        <span>{job.views || 0} views</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">Job Description</h3>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {job.description}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <div className="flex items-center text-green-600 font-semibold text-lg">
                      <DollarSign className="h-5 w-5 mr-1" />
                      <span>{job.salary ? `$${job.salary.toLocaleString()}` : 'Not specified'}</span>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={handleSaveJob}
                        disabled={savingJob || saved}
                      >
                        {saved ? (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                            Saved
                          </>
                        ) : (
                          <>
                            <Heart className="mr-2 h-4 w-4" />
                            Save Job
                          </>
                        )}
                      </Button>
                      <Button onClick={handleApply} disabled={applying}>
                        {applying ? 'Applying...' : 'Apply Now'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Job Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Job Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Posted by</span>
                  <span className="font-medium">{job.company}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Posted on</span>
                  <span className="font-medium">{getTimeAgo(job.createdAt)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Job Type</span>
                  <Badge variant="secondary">{job.jobType}</Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Location</span>
                  <span className="font-medium">{`${job.region}, ${job.country}`}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Category</span>
                  <Badge variant="outline">{job.category}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Company Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">About {job.company}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <Building className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{job.company}</h4>
                    <p className="text-sm text-gray-600">{job.category} Company</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">
                  Learn more about this company and their other job openings.
                </p>
                <Button variant="outline" className="w-full mt-4" asChild>
                  <Link href={`/companies/${job.company.toLowerCase().replace(/\s+/g, '-')}`}>
                    View Company Profile
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={handleApply} 
                  className="w-full" 
                  size="lg"
                  disabled={applying}
                >
                  <Briefcase className="mr-2 h-4 w-4" />
                  {applying ? 'Applying...' : 'Apply for this Job'}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleSaveJob}
                  className="w-full"
                  disabled={savingJob || saved}
                >
                  {saved ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                      Job Saved
                    </>
                  ) : (
                    <>
                      <Heart className="mr-2 h-4 w-4" />
                      Save for Later
                    </>
                  )}
                </Button>
                
                <Button variant="outline" className="w-full">
                  <User className="mr-2 h-4 w-4" />
                  Set Job Alert
                </Button>
              </CardContent>
            </Card>

          </div>
        </div>

        {/* Related Jobs Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Similar Jobs</h2>
          <div className="text-center py-8 text-gray-500">
            <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Similar job recommendations will appear here</p>
          </div>
        </div>
      </div>
    </div>
  )
}