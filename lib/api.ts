const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://alx-project-nexus-backend.onrender.com/api';


interface ApiResponse<T = any> {
  data?: T
  error?: string
  status?: number
  isFromFallback?: boolean
}

interface JobFilters {
  search?: string
  ordering?: string
  page?: number
  size?: number
}

interface Job {
  _id: string;
  title: string;
  description: string;
  company: string;
  country: string;
  region: string;
  jobType: string;
  category: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  salary?: number;
  views?: number;
}

interface JobApplication {
  id?: number
  applicant?: string
  status: string
  resume?: string
  cover_letter: string
  applied_at?: string
  job: number
}

interface SavedJob {
  id?: number
  job: number
  job_title?: string
  saved_at?: string
}

interface UserProfile {
  id?: number
  first_name: string
  last_name: string
  country: string
  phone_number?: string
  job_title?: string
  gender?: string
  profile_picture?: string
  bio?: string
  resume?: string
  linkedin?: string
  skills?: string
  portfolio?: string
  profile_completed?: boolean
  user?: number
}

interface Category {
  id?: number
  category_name: string
}

class ApiClient {
  private baseUrl = BASE_URL

  // Helper method to get auth headers
  private getAuthHeaders(): HeadersInit {
    const token = this.getToken()
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    }
  }

  // Helper method to handle API responses
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      if (response.ok) {
        const data = await response.json()
        return { data, status: response.status }
      } else {
        const errorData = await response.text()
        let errorMessage = `HTTP ${response.status}`
        
        try {
          const errorJson = JSON.parse(errorData)
          if (errorJson.detail) {
            errorMessage = errorJson.detail
          } else if (errorJson.message) {
            errorMessage = errorJson.message
          } else if (typeof errorJson === 'string') {
            errorMessage = errorJson
          }
        } catch {
          errorMessage = errorData || response.statusText
        }

        return { error: errorMessage, status: response.status }
      }
    } catch (error) {
      return { error: 'Network error occurred', status: 0 }
    }
  }

  // Token management
  getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('token')
  }

  isAuthenticated(): boolean {
    return !!this.getToken()
  }

  // Auth endpoints
  async login(credentials: { email: string; password: string }): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/users/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      return this.handleResponse(response)
    } catch (error) {
      return { error: 'Network error occurred' }
    }
  }

  async register(userData: {
    email: string
    first_name: string
    last_name: string
    password: string
    confirm_password: string
  }): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/users/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      return this.handleResponse(response)
    } catch (error) {
      return { error: 'Network error occurred' }
    }
  }

  async logout(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/users/logout/`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      })

      return this.handleResponse(response)
    } catch (error) {
      return { error: 'Network error occurred' }
    }
  }

  // Profile endpoints
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await fetch(`${this.baseUrl}/users/profile/update/`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })

      return this.handleResponse<UserProfile>(response)
    } catch (error) {
      return { error: 'Network error occurred' }
    }
  }

  async updateProfile(profileData: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await fetch(`${this.baseUrl}/users/profile/update/`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(profileData),
      })

      return this.handleResponse<UserProfile>(response)
    } catch (error) {
      return { error: 'Network error occurred' }
    }
  }

  async getProfileResume(): Promise<ApiResponse> {
    try {
      const response = await this.makeAuthenticatedRequest('/users/profile/resume/')

      return this.handleResponse(response)
    } catch (error) {
      return { error: 'Network error occurred' }
    }
  }

  async getProfileStatus(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/users/profile/status/`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })

      return this.handleResponse(response)
    } catch (error) {
      return { error: 'Network error occurred' }
    }
  }

  async requestRole(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/users/request-role/`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      })

      return this.handleResponse(response)
    } catch (error) {
      return { error: 'Network error occurred' }
    }
  }

  // Job endpoints
  private async makeAuthenticatedRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const defaultOptions: RequestInit = {
      method: 'GET',
      headers: this.getAuthHeaders(),
    };

    const mergedOptions: RequestInit = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    return fetch(`${this.baseUrl}${endpoint}`, mergedOptions);
  }

  async getJobs(page: number = 1, filters?: JobFilters): Promise<ApiResponse<{ results: Job[]; next: string | null; count: number }>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        ...(filters?.search && { search: filters.search }),
        ...(filters?.ordering && { ordering: filters.ordering }),
        ...(filters?.size && { size: filters.size.toString() }),
      });

      const response = await fetch(`${this.baseUrl}/jobs?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorResult = await this.handleResponse(response);
        return { ...errorResult, data: { results: [], next: null, count: 0 } };
      }

      const jobs: Job[] = await response.json();
      
      return {
        data: {
          results: jobs,
          next: null, // Assuming the backend does not provide pagination info in this format
          count: jobs.length,
        },
        status: response.status,
      };
    } catch (error) {
      return { error: 'Network error occurred' };
    }
  }

  async getJob(id: string): Promise<ApiResponse<Job>> {
    try {
      const response = await fetch(`${this.baseUrl}/jobs/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      })

      return this.handleResponse<Job>(response)
    } catch (error) {
      return { error: 'Network error occurred' }
    }
  }

  async createJob(jobData: Omit<Job, 'id' | 'posted_by' | 'category' | 'posted_at' | 'view_count' | 'status'>): Promise<ApiResponse<Job>> {
    try {
      const response = await fetch(`${this.baseUrl}/jobs/create/`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(jobData),
      })

      return this.handleResponse<Job>(response)
    } catch (error) {
      return { error: 'Network error occurred' }
    }
  }

  async updateJob(id: number, jobData: Partial<Job>): Promise<ApiResponse<Job>> {
    try {
      const response = await fetch(`${this.baseUrl}/jobs/${id}/update/`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(jobData),
      })

      return this.handleResponse<Job>(response)
    } catch (error) {
      return { error: 'Network error occurred' }
    }
  }

  async deleteJob(id: number): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/jobs/${id}/delete/`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      })

      return this.handleResponse(response)
    } catch (error) {
      return { error: 'Network error occurred' }
    }
  }

  // Job Application endpoints
  async applyToJob(jobId: number, applicationData: Omit<JobApplication, 'id' | 'applicant' | 'applied_at' | 'resume'>): Promise<ApiResponse<JobApplication>> {
    try {
      const response = await fetch(`${this.baseUrl}/jobs/${jobId}/apply/`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(applicationData),
      })

      return this.handleResponse<JobApplication>(response)
    } catch (error) {
      return { error: 'Network error occurred' }
    }
  }

  async getApplications(page: number = 1): Promise<ApiResponse<{ results: JobApplication[]; next: string | null; count: number }>> {
    try {
      const response = await fetch(`${this.baseUrl}/applications/recruiter/?page=${page}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })

      return this.handleResponse(response)
    } catch (error) {
      return { error: 'Network error occurred' }
    }
  }

  async updateApplication(id: number, applicationData: Partial<JobApplication>): Promise<ApiResponse<JobApplication>> {
    try {
      const response = await fetch(`${this.baseUrl}/applications/${id}/update/`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(applicationData),
      })

      return this.handleResponse<JobApplication>(response)
    } catch (error) {
      return { error: 'Network error occurred' }
    }
  }

  async deleteApplication(id: number): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/applications/${id}/delete/`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      })

      return this.handleResponse(response)
    } catch (error) {
      return { error: 'Network error occurred' }
    }
  }

  // Saved Jobs endpoints
  async getSavedJobs(page: number = 1): Promise<ApiResponse<{ results: SavedJob[]; next: string | null; count: number }>> {
    try {
      const response = await fetch(`${this.baseUrl}/saved-jobs/?page=${page}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })

      return this.handleResponse(response)
    } catch (error) {
      return { error: 'Network error occurred' }
    }
  }

  async saveJob(jobId: string): Promise<ApiResponse<SavedJob>> {
    try {
      const response = await fetch(`${this.baseUrl}/saved-jobs/create/`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ job: jobId }),
      })

      return this.handleResponse<SavedJob>(response)
    } catch (error) {
      return { error: 'Network error occurred' }
    }
  }

  async unsaveJob(id: number): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/saved-jobs/${id}/delete/`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      })

      return this.handleResponse(response)
    } catch (error) {
      return { error: 'Network error occurred' }
    }
  }

  // Categories endpoints
  async getCategories(): Promise<ApiResponse<{ results: Category[]; next: string | null; count: number }>> {
    try {
      const response = await fetch(`${this.baseUrl}/categories/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      })

      return this.handleResponse(response);
    } catch (error) {
      return { error: 'Network error occurred' };
    }
  }

  async createCategory(categoryData: Omit<Category, 'id'>): Promise<ApiResponse<Category>> {
    try {
      const response = await fetch(`${this.baseUrl}/categories/create/`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(categoryData),
      })

      return this.handleResponse<Category>(response)
    } catch (error) {
      return { error: 'Network error occurred' }
    }
  }

  async updateCategory(id: number, categoryData: Partial<Category>): Promise<ApiResponse<Category>> {
    try {
      const response = await fetch(`${this.baseUrl}/categories/${id}/update/`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(categoryData),
      })

      return this.handleResponse<Category>(response)
    } catch (error) {
      return { error: 'Network error occurred' }
    }
  }

  async deleteCategory(id: number): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/categories/${id}/delete/`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      })

      return this.handleResponse(response)
    } catch (error) {
      return { error: 'Network error occurred' }
    }
  }


}

export const apiClient = new ApiClient()
export type { Job, JobApplication, SavedJob, UserProfile, Category, JobFilters }