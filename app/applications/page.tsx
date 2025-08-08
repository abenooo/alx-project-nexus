'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, ArrowLeft, Briefcase, Clock, CheckCircle, XCircle, FileText } from 'lucide-react'
import { apiClient, type JobApplication, type Job } from '@/lib/api'

// Extended JobApplication interface to include populated job data
interface PopulatedJobApplication extends Omit<JobApplication, 'job'> {
  job: Job | string // Can be either populated Job object or just job ID string
}

export default function ApplicationsPage() {
  const router = useRouter()
  const [applications, setApplications] = useState<PopulatedJobApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!apiClient.isAuthenticated()) {
      router.push('/login')
      return
    }
    fetchApplications()
  }, [router])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getApplications()
      
      if (response.data) {
        setApplications(response.data.results || [])
      } else if (response.error) {
        setError(response.error)
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
      setError('Failed to load applications. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'submitted':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="h-3 w-3 mr-1" /> Submitted
          </span>
        )
      case 'accepted':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" /> Accepted
          </span>
        )
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" /> Rejected
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        )
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Loading your applications...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
          <div className="w-24"></div> {/* For alignment */}
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {applications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
              <p className="text-gray-500 mb-6">You haven't applied to any jobs yet.</p>
              <Button onClick={() => router.push('/')}>
                <Briefcase className="h-4 w-4 mr-2" />
                Browse Jobs
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <Card key={application._id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {typeof application.job === 'object' ? application.job.title : 'Job Title N/A'}
                      </CardTitle>
                      <CardDescription>
                        {typeof application.job === 'object' ? application.job.company : 'Company N/A'}
                      </CardDescription>
                    </div>
                    {getStatusBadge(application.status || 'submitted')}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <p className="font-medium">Applied On</p>
                      <p>{application.applied_at ? formatDate(application.applied_at) : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="font-medium">Last Updated</p>
                      <p>{application.updatedAt ? formatDate(application.updatedAt) : 'N/A'}</p>
                    </div>
                  </div>
                  {application.coverLetter && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-medium mb-2">Your Cover Letter</h4>
                      <p className="text-gray-600 text-sm whitespace-pre-line">
                        {application.coverLetter}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}