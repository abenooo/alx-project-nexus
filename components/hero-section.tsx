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
          </div>
        </div>
    
      </div>
    </div>
  )
}
