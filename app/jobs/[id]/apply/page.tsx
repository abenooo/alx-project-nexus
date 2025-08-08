// app/jobs/[id]/apply/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, Briefcase, Building, MapPin, 
  DollarSign, Clock, CheckCircle, Loader2,
  Upload, FileText
} from 'lucide-react'
import Link from 'next/link'
import { apiClient, type Job, type UserProfile } from '@/lib/api'

export default function JobApplicationPage() {
  const params = useParams()
  const router = useRouter()
  // Ensure we get the full ID from the URL parameters
  const jobId = Array.isArray(params.id) ? params.id[0] : params.id || ''
  
  // Validate the job ID format
  useEffect(() => {
    if (jobId && !/^[0-9a-fA-F]{24}$/.test(jobId)) {
      setError('Invalid job ID format')
      router.push('/jobs')
    }
  }, [jobId, router])
  
  const [job, setJob] = useState<Job | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [coverLetter, setCoverLetter] = useState('')
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Check authentication first
    if (!apiClient.isAuthenticated()) {
      router.push('/login')
      return
    }

    if (jobId) {
      Promise.all([fetchJob(), fetchProfile()])
    }
  }, [jobId, router])

  const fetchJob = async () => {
    try {
      const response = await apiClient.getJob(jobId)
      
      if (response.data) {
        setJob(response.data)
      } else {
        setError('Job not found')
      }
    } catch (error) {
      setError('Failed to load job details')
      console.error('Error fetching job:', error)
    }
  }
  const fetchProfile = async () => {
    try {
      const response = await apiClient.getMe();
      
      if (response.data) {
        // Transform the data to match UserProfile
        const userProfile: UserProfile = {
          first_name: response.data.name || response.data.name?.split(' ')[0] || '',
          last_name: response.data.email || response.data.name?.split(' ')[1] || '',
          country: response.data.country || '',
          // ... mapother fields as needed
        };
        setProfile(userProfile);
      } else if (response.status === 401 || response.status === 403) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };
 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!coverLetter.trim()) {
      setError('Please provide a cover letter')
      return
    }

    setApplying(true)
    setError('')

    try {
      const response = await apiClient.applyToJob(jobId, {
        jobId: jobId,
        coverLetter: coverLetter,
        status: 'submitted'
      });

      if (response.data) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/applications');
        }, 2000);
      } else if (response.status === 401 || response.status === 403) {
        setError('Please log in to apply for jobs');
        router.push('/login');
      } else {
        setError(response.error || 'Failed to submit application. Please try again.');
        console.error('Application error:', response);
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Application error:', error);
    } finally {
      setApplying(false);
    }
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
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Loading application form...</span>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="text-center py-12">
            <CardContent>
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Application Submitted Successfully!
              </h1>
              <p className="text-gray-600 mb-6">
                Your application for {job?.title} at {job?.company} has been submitted.
                We'll notify you about the status of your application.
              </p>
              <div className="flex gap-4 justify-center">
                <Button asChild>
                  <Link href="/applications">
                    View My Applications
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/">
                    Browse More Jobs
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error && !job) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button variant="ghost" onClick={() => router.back()} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Alert variant="destructive">
            <AlertDescription>
              {error}
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                  Retry
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/">Browse Jobs</Link>
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  if (!job) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Job Details
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Application Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Apply for this Position</CardTitle>
                <p className="text-gray-600">
                  Fill out the form below to submit your application
                </p>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertDescription>
                      {error}
                      {error.includes('profile') && (
                        <Button variant="outline" size="sm" className="ml-4" asChild>
                          <Link href="/profile">Complete Profile</Link>
                        </Button>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Profile Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Your Profile</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {profile?.first_name} {profile?.last_name} • {profile?.email}
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/profile">View Full Profile</Link>
                    </Button>
                  </div>

                  {/* Cover Letter */}
                  <div className="space-y-2">
                    <Label htmlFor="cover_letter" className="text-base font-semibold">
                      Cover Letter *
                    </Label>
                    <p className="text-sm text-gray-600">
                      Tell the employer why you're interested in this role and what makes you a great fit.
                    </p>
                    <Textarea
                      id="cover_letter"
                      placeholder="Dear Hiring Manager,&#10;&#10;I am writing to express my interest in the [Job Title] position at [Company Name]. With my experience in..."
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      rows={8}
                      className="resize-none"
                      required
                    />
                    <div className="text-right text-sm text-gray-500">
                      {coverLetter.length} characters
                    </div>
                  </div>



                  {/* Submit Button */}
                  <div className="flex gap-4 pt-4">
                    <Button
                      type="submit"
                      disabled={applying}
                      className="flex-1"
                    >
                      {applying ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting Application...
                        </>
                      ) : (
                        <>
                          <Briefcase className="mr-2 h-4 w-4" />
                          Submit Application
                        </>
                      )}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Job Summary Sidebar */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Job Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{job.title}</h3>
                    <div className="flex items-center text-gray-600 mb-2">
                      <Building className="h-4 w-4 mr-1" />
                      <span>{job.company}</span>
                    </div>
                    <div className="flex items-center text-gray-500 text-sm">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{job.region}</span>
                    </div>
                  </div>

                  <div className="flex items-center text-green-600 font-semibold">
                    <DollarSign className="h-4 w-4 mr-1" />
                    <span>{job.salary}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{job.jobType}</Badge>
                    <Badge variant="outline">{job.category}</Badge>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center text-gray-500 text-sm mb-2">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>Posted {getTimeAgo(job.createdAt)}</span>
                    </div>
                    {job.expiresAt && (
                      <div className="text-sm text-amber-600">
                        Application deadline: {new Date(job.expiresAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Application Tips */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Application Tips</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-3">
                <div>
                  <h4 className="font-medium mb-1">Write a compelling cover letter</h4>
                  <p className="text-gray-600">Customize your cover letter for this specific role and company.</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Complete your profile</h4>
                  <p className="text-gray-600">A complete profile increases your chances of getting noticed.</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Upload your resume</h4>
                  <p className="text-gray-600">Make sure your resume is up-to-date and relevant to the position.</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Follow up</h4>
                  <p className="text-gray-600">You can track your application status in your dashboard.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}