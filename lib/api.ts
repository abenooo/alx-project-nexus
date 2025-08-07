const API_BASE_URL = 'https://mysite-z2xs.onrender.com/api'

interface ApiResponse<T> {
  data?: T
  error?: string
  status: number
  isFromFallback?: boolean
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`
      console.log(`API Request: ${options.method || 'GET'} ${url}`)

      // Define headers with proper typing
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }

      // Add auth header if we have a token
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const config: RequestInit = {
        mode: 'cors',
        headers: {
          ...headers,
          ...options.headers,
        },
        ...options,
      }

      const response = await fetch(url, config)
      
      console.log(`API Response: ${response.status} ${response.statusText}`)

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        try {
          const errorText = await response.text()
          // Use console.warn for auth errors (401/403) to reduce noise
          if (response.status === 401 || response.status === 403) {
            console.warn('API Auth Response:', errorText)
          } else {
            console.error('API Error Response:', errorText)
          }
          if (errorText) {
            errorMessage = errorText
          }
        } catch (e) {
          console.error('Could not read error response:', e)
        }
        
        return {
          error: errorMessage,
          status: response.status
        }
      }

      const data = await response.json()
      console.log('API Success:', data)

      return {
        data,
        status: response.status
      }
    } catch (error) {
      console.error('Network Error:', error)
      
      return {
        error: error instanceof Error ? error.message : 'Network error occurred',
        status: 0
      }
    }
  }

  // Check if user is authenticated (has valid token)
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false
    const token = localStorage.getItem('token')
    return !!token
  }

  // Jobs API - Always returns data, never throws
  async getJobs(page: number = 1): Promise<ApiResponse<{
    count: number
    next: string | null
    previous: string | null
    results: any[]
  }>> {
    console.log(`Getting jobs for page ${page}`)
    
    try {
      const response = await this.makeRequest<{
        count: number
        next: string | null
        previous: string | null
        results: any[]
      }>(`/jobs/?page=${page}`)

      // If successful, return the data
      if (response.data) {
        console.log('Successfully got jobs from API')
        // Ensure we have a valid response structure
        if (!response.data.results) {
          response.data.results = []
        }
        return response
      }

      // If we have an error, log it but don't return fallback yet
      if (response.error) {
        console.error('Error getting jobs:', response.error)
        // Only return fallback if it's not an auth error
        if (response.status !== 401 && response.status !== 403) {
          console.log('Non-auth error, returning fallback jobs')
          return this.getFallbackJobs(page)
        }
        // For auth errors, return empty results
        return {
          data: {
            count: 0,
            next: null,
            previous: null,
            results: []
          },
          status: response.status,
          error: response.error
        }
      }
      
      // If we get here, something unexpected happened
      console.log('Unexpected response format, returning fallback jobs')
      return this.getFallbackJobs(page)
      
    } catch (error) {
      const errorStatus = (error as any)?.status || 500;
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch jobs';
      
      // Only return fallback if it's not an auth error
      if (errorStatus !== 401 && errorStatus !== 403) {
        return this.getFallbackJobs(page);
      }
      // For auth errors, return empty results
      return {
        data: {
          count: 0,
          next: null,
          previous: null,
          results: []
        },
        status: errorStatus,
        error: errorMessage
      };
    }
  }

  private getFallbackJobs(page: number = 1): ApiResponse<{
    count: number
    next: string | null
    previous: string | null
    results: any[]
  }> {
    return {
      data: {
        count: fallbackJobs.length,
        next: null,
        previous: null,
        results: page === 1 ? fallbackJobs : []
      },
      status: 200,
      isFromFallback: true
    }
  }

  async getJob(id: number): Promise<ApiResponse<any>> {
    try {
      const response = await this.makeRequest(`/jobs/${id}/`)
      
      if (response.data && response.status === 200) {
        return response
      }

      // Return fallback job if available
      const fallbackJob = fallbackJobs.find(job => job.id === id)
      if (fallbackJob) {
        return {
          data: fallbackJob,
          status: 200,
          isFromFallback: true
        }
      }

      return {
        error: 'Job not found',
        status: 404
      }
    } catch (error) {
      console.error('Exception in getJob:', error)
      
      // Try to return fallback job
      const fallbackJob = fallbackJobs.find(job => job.id === id)
      if (fallbackJob) {
        return {
          data: fallbackJob,
          status: 200,
          isFromFallback: true
        }
      }

      return {
        error: 'Job not found',
        status: 404
      }
    }
  }

  async createJob(jobData: any): Promise<ApiResponse<any>> {
    try {
      return await this.makeRequest('/jobs/create/', {
        method: 'POST',
        body: JSON.stringify(jobData)
      })
    } catch (error) {
      console.error('Exception in createJob:', error)
      return {
        error: 'Failed to create job',
        status: 500
      }
    }
  }

  // Auth API
  async login(credentials: { email: string; password: string }): Promise<ApiResponse<any>> {
    try {
      const response = await this.makeRequest('/users/login/', {
        method: 'POST',
        body: JSON.stringify(credentials)
      })

      // If we got a successful response with data, return it as is
      if (response.data) {
        return response
      }

      // If we didn't get data but have an error, return that
      if (response.error) {
        return response
      }

      // If we got here, something unexpected happened
      return {
        error: 'Invalid response format from server',
        status: 500
      }
    } catch (error) {
      console.error('Exception in login:', error)
      return {
        error: error instanceof Error ? error.message : 'Login failed',
        status: 500
      }
    }
  }

  async register(userData: any): Promise<ApiResponse<any>> {
    try {
      return await this.makeRequest('/users/register/', {
        method: 'POST',
        body: JSON.stringify(userData)
      })
    } catch (error) {
      console.error('Exception in register:', error)
      return {
        error: 'Registration failed',
        status: 500
      }
    }
  }

  async getProfile(): Promise<ApiResponse<any>> {
    // Only call if we have a token
    if (!this.isAuthenticated()) {
      return {
        error: 'No authentication token',
        status: 401
      }
    }

    try {
      return await this.makeRequest('/users/profile/status/')
    } catch (error) {
      console.error('Exception in getProfile:', error)
      return {
        error: 'Failed to get profile',
        status: 500
      }
    }
  }

  async getProfileResume(): Promise<ApiResponse<any>> {
    if (!this.isAuthenticated()) {
      return {
        error: 'No authentication token',
        status: 401
      }
    }

    try {
      return await this.makeRequest('/users/profile/resume/')
    } catch (error) {
      console.error('Exception in getProfileResume:', error)
      return {
        error: 'Failed to get profile resume',
        status: 500
      }
    }
  }

  async logout(): Promise<ApiResponse<any>> {
    try {
      return await this.makeRequest('/users/logout/', {
        method: 'POST'
      })
    } catch (error) {
      console.error('Exception in logout:', error)
      return {
        error: 'Logout failed',
        status: 500
      }
    }
  }

  // Categories API - Always returns data
  async getCategories(): Promise<ApiResponse<{ results: any[] }>> {
    try {
      const response = await this.makeRequest<{ results: any[] }>('/categories/')
      
      if (response.data && response.status === 200) {
        return response
      }

      // Return fallback categories
      return this.getFallbackCategories()
      
    } catch (error) {
      console.error('Exception in getCategories, returning fallback:', error)
      return this.getFallbackCategories()
    }
  }

  private getFallbackCategories(): ApiResponse<{ results: any[] }> {
    return {
      data: {
        results: fallbackCategories
      },
      status: 200,
      isFromFallback: true
    }
  }

  // Saved Jobs API
  async saveJob(jobId: number): Promise<ApiResponse<any>> {
    try {
      return await this.makeRequest('/saved-jobs/create/', {
        method: 'POST',
        body: JSON.stringify({ job: jobId })
      })
    } catch (error) {
      console.error('Exception in saveJob:', error)
      return {
        error: 'Failed to save job',
        status: 500
      }
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL)

// Fallback categories
const fallbackCategories = [
  { id: 1, category_name: 'Technology' },
  { id: 2, category_name: 'Marketing' },
  { id: 3, category_name: 'Design' },
  { id: 4, category_name: 'Sales' },
  { id: 5, category_name: 'Finance' },
  { id: 6, category_name: 'Healthcare' },
  { id: 7, category_name: 'Education' },
  { id: 8, category_name: 'Engineering' },
  { id: 9, category_name: 'Customer Service' },
  { id: 10, category_name: 'Operations' }
]

// Fallback data for when API is unavailable or requires authentication
export const fallbackJobs = [
  {
    id: 1,
    title: "Senior Software Engineer",
    company_name: "Tech Corp",
    location: "San Francisco, CA",
    salary: "$120,000 - $160,000",
    job_type: "full-time",
    description: "We are looking for a senior software engineer to join our team and help build scalable web applications. You'll work with React, Node.js, and cloud technologies to create innovative solutions that serve millions of users worldwide.",
    posted_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
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
    description: "Join our product team to drive innovation and growth. You'll be responsible for product strategy, roadmap planning, and cross-functional collaboration with engineering and design teams to deliver exceptional user experiences.",
    posted_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    category_name: "Product",
    industry: "Technology"
  },
  {
    id: 3,
    title: "UX Designer",
    company_name: "Design Studio",
    location: "Los Angeles, CA",
    salary: "$80,000 - $110,000",
    job_type: "full-time",
    description: "We're seeking a talented UX designer to create intuitive and engaging user experiences for our digital products. Experience with Figma, user research, prototyping, and design systems required.",
    posted_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    category_name: "Design",
    industry: "Creative"
  },
  {
    id: 4,
    title: "Data Scientist",
    company_name: "Analytics Pro",
    location: "Austin, TX",
    salary: "$110,000 - $150,000",
    job_type: "full-time",
    description: "Join our data science team to extract insights from large datasets and build predictive models using Python and machine learning. Experience with SQL, pandas, scikit-learn, and data visualization tools preferred.",
    posted_at: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
    category_name: "Data Science",
    industry: "Technology"
  },
  {
    id: 5,
    title: "Marketing Manager",
    company_name: "Growth Co",
    location: "Chicago, IL",
    salary: "$70,000 - $95,000",
    job_type: "full-time",
    description: "Lead our marketing efforts across digital channels. Experience with SEO, content marketing, social media, email marketing, and marketing automation tools required. Help us scale our customer acquisition and retention strategies.",
    posted_at: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
    category_name: "Marketing",
    industry: "Marketing"
  },
  {
    id: 6,
    title: "DevOps Engineer",
    company_name: "Cloud Systems",
    location: "Seattle, WA",
    salary: "$105,000 - $135,000",
    job_type: "full-time",
    description: "We're looking for a DevOps engineer to help us build and maintain our cloud infrastructure. Experience with AWS, Docker, Kubernetes, Terraform, and CI/CD pipelines required. Join our mission to scale reliable systems.",
    posted_at: new Date(Date.now() - 518400000).toISOString(), // 6 days ago
    category_name: "Technology",
    industry: "Cloud Computing"
  },
  {
    id: 7,
    title: "Sales Representative",
    company_name: "SalesPro Inc",
    location: "Miami, FL",
    salary: "$60,000 - $90,000 + Commission",
    job_type: "full-time",
    description: "Join our dynamic sales team and help drive revenue growth. We're looking for motivated individuals with excellent communication skills and a passion for building relationships with clients in the B2B space.",
    posted_at: new Date(Date.now() - 604800000).toISOString(), // 7 days ago
    category_name: "Sales",
    industry: "Sales"
  },
  {
    id: 8,
    title: "Financial Analyst",
    company_name: "Finance Plus",
    location: "Boston, MA",
    salary: "$75,000 - $95,000",
    job_type: "full-time",
    description: "We're seeking a detail-oriented financial analyst to join our team. You'll be responsible for financial modeling, budgeting, forecasting, and providing insights to support strategic business decisions and growth initiatives.",
    posted_at: new Date(Date.now() - 691200000).toISOString(), // 8 days ago
    category_name: "Finance",
    industry: "Finance"
  }
]
