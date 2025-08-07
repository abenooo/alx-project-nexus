import { Suspense } from 'react'
import { JobSearch } from '@/components/job-search'
import { JobListImproved } from '@/components/job-list-improved'
import { HeroSection } from '@/components/hero-section'
import { JobListSkeleton } from '@/components/job-list-skeleton'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      <div className="container mx-auto px-4 py-8">
        <JobSearch />
        <Suspense fallback={<JobListSkeleton />}>
          <JobListImproved />
        </Suspense>
      </div>
    </div>
  )
}
