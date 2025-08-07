import { Button } from '@/components/ui/button'
import { Search, Briefcase, Users, Building } from 'lucide-react'
import Link from 'next/link'

export function HeroSection() {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Find Your Dream Job
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Discover thousands of job opportunities from top companies
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="#jobs">
                <Search className="mr-2 h-5 w-5" />
                Browse Jobs
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600" asChild>
              <Link href="/login">
                <Briefcase className="mr-2 h-5 w-5" />
                Sign In to Post Jobs
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="text-center">
            <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Briefcase className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">1000+ Jobs</h3>
            <p className="opacity-90">Active job listings from verified companies</p>
          </div>
          <div className="text-center">
            <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">50k+ Candidates</h3>
            <p className="opacity-90">Talented professionals looking for opportunities</p>
          </div>
          <div className="text-center">
            <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Building className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">500+ Companies</h3>
            <p className="opacity-90">Top employers across various industries</p>
          </div>
        </div>
      </div>
    </div>
  )
}
