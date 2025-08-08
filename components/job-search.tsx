'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, MapPin, Briefcase } from 'lucide-react'

interface JobSearchProps {
  onSearch?: (filters: SearchFilters) => void
}

interface SearchFilters {
  keyword: string
  location: string
  jobType: string
  category: string
}

export function JobSearch({ onSearch }: JobSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    keyword: '',
    location: '',
    jobType: '',
    category: ''
  })

  const handleSearch = () => {
    onSearch?.(filters)
  }

  const handleEnterKey: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    }
  }

  return (
    <div id="jobs" className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Job title, keywords..."
            value={filters.keyword}
            onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
            onKeyDown={handleEnterKey}
            className="pl-10"
          />
        </div>
        
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Location"
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            onKeyDown={handleEnterKey}
            className="pl-10"
          />
        </div>
        
        <Select
          value={filters.jobType}
          onValueChange={(value) => {
            const next = { ...filters, jobType: value }
            setFilters(next)
            onSearch?.(next)
          }}
        >
          <SelectTrigger>
            <Briefcase className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Job Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="full-time">Full Time</SelectItem>
            <SelectItem value="part-time">Part Time</SelectItem>
            <SelectItem value="contract">Contract</SelectItem>
            <SelectItem value="freelance">Freelance</SelectItem>
            <SelectItem value="internship">Internship</SelectItem>
          </SelectContent>
        </Select>
        
        <Button onClick={handleSearch} className="w-full">
          <Search className="mr-2 h-4 w-4" />
          Search Jobs
        </Button>
      </div>
    </div>
  )
}
