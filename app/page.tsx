'use client'
import { Suspense } from 'react'
import { JobSearch } from '@/components/job-search'
import { JobListImproved } from '@/components/job-list-improved'
import { HeroSection } from '@/components/hero-section'
import { JobListSkeleton } from '@/components/job-list-skeleton'
import { useState } from 'react'

export default function HomePage() {
  const [filters, setFilters] = useState({
    keyword: '',
    location: '',
    jobType: '',
    category: ''
  })

  const handleSearch = (nextFilters: typeof filters) => {
    setFilters(nextFilters)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      <div className="container mx-auto px-4 py-8">
        <JobSearch onSearch={handleSearch} />
        <Suspense fallback={<JobListSkeleton />}>
          <JobListImproved filters={filters} />
        </Suspense>
      </div>
    </div>
  )
}
