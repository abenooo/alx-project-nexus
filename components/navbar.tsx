'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Briefcase, User, Settings, LogOut, Plus, Heart } from 'lucide-react'
import { apiClient } from '@/lib/api'

interface UserProfile {
  id: number
  first_name: string
  last_name: string
  email?: string
  country?: string
  phone_number?: string
  job_title?: string
  gender?: string
  profile_picture?: string | null
  bio?: string
  resume?: string | null
  linkedin?: string
  skills?: string
  portfolio?: string
  profile_completed: boolean
  user: number
}

interface User {
  id: string
  name: string
  email: string
  token?: string
  // Optional fields from the profile
  first_name?: string
  last_name?: string
  profile?: UserProfile
}

export function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    // Skip on server-side
    if (typeof window === 'undefined') {
      setLoading(false)
      return
    }

    try {
      // First check if we have a token
      const token = localStorage.getItem('token')
      if (!token) {
        // Clear any stale user data if no token exists
        if (localStorage.getItem('user')) {
          localStorage.removeItem('user')
        }
        setUser(null)
        setLoading(false)
        return
      }

      // Check if we have user data in localStorage
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser)
          setUser(userData)
        } catch (e) {
          console.error('Error parsing stored user data:', e)
          localStorage.removeItem('user')
        }
      }

      try {
        // Get the user's data using the getMe endpoint
        const userResponse = await apiClient.getMe()
        
        if (userResponse.data) {
          // The getMe endpoint returns the user data directly
          const userData = userResponse.data as User;
          
          // Transform the data to match our User interface
          const user: User = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            // Include any token if present
            ...(userData.token && { token: userData.token }),
            // Map any other fields that might be needed
            ...(userData.first_name && { first_name: userData.first_name }),
            ...(userData.last_name && { last_name: userData.last_name }),
            // Include profile if available
            ...(userData.profile && { profile: userData.profile })
          };
          
          // Update the stored user data
          localStorage.setItem('user', JSON.stringify(user));
          setUser(user);
        } else if (userResponse.status === 401 || userResponse.status === 403) {
          // Token is invalid, clear it
          console.log('Invalid token, clearing authentication')
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setUser(null)
        } else {
          console.log('User data fetch failed:', userResponse.error)
        }
      } catch (error) {
        console.error('Error in checkAuthStatus:', error)
        // If there's an error, clear auth data to be safe
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      if (apiClient.isAuthenticated()) {
        try {
          await apiClient.logout()
        } catch (error) {
          console.error('Error during logout API call:', error)
          // Continue with client-side cleanup even if API call fails
        }
      }
    } catch (error) {
      console.error('Error in logout handler:', error)
    } finally {
      // Always clear client-side authentication state
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setUser(null)
      
      // Refresh the page to ensure all components are in sync
      window.location.href = '/'
    }
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Briefcase className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">JobPortal</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              Jobs
            </Link>
            <Link href="/companies" className="text-gray-600 hover:text-gray-900">
              Companies
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900">
              About
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
            ) : user ? (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/post-job">
                    <Plus className="h-4 w-4 mr-2" />
                    Post Job
                  </Link>
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder.svg" alt={user.name} />
                        <AvatarFallback>
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <Avatar className="h-10 w-10">
                        <AvatarImage 
                          src={user.profile?.profile_picture || ''} 
                          alt={`${user.first_name} ${user.last_name}`} 
                        />
                        <AvatarFallback>
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">
                          {user.name}
                        </p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user.profile?.job_title || 'No title'}
                        </p>
                        <p className="w-[200px] truncate text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/saved-jobs">
                        <Heart className="mr-2 h-4 w-4" />
                        Saved Jobs
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/applications">
                        <Briefcase className="mr-2 h-4 w-4" />
                        My Applications
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
