const BASE_URL = process.env.BASE_URL || 'https://alx-project-nexus-backend.onrender.com/api';


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
  expiresAt?: string;
}

interface JobApplication {
  _id?: string;
  user: string;
  job: string;
  jobId?: string;
  coverLetter: string;
  status: string;
  applied_at?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  resume?: string;
  id?: string;
  applicant?: string;
}

interface SavedJob {
  id?: number
  job: number
  job_title?: string
  saved_at?: string
}
interface User {
  id: string;
  name: string;
  email: string;
  country?: string; 
}

interface UserProfile {
  id?: number
  first_name: string
  last_name: string
  email?: string
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

  private getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    console.log('Current auth token:', token ? 'Token exists' : 'No token found');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    console.log('Request headers:', headers);
    return headers;
  }

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

  getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('token')
  }

  isAuthenticated(): boolean {
    return !!this.getToken()
  }

  async login(credentials: { email: string; password: string }): Promise<ApiResponse<{ user: User & { token: string } }>> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      return this.handleResponse(response);
    } catch (error) {
      return { error: 'Network error occurred' };
    }
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
  }): Promise<ApiResponse<{ user: User & { token: string } }>> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/register`, {
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

  async getMe(): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/me`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      return this.handleResponse<User>(response);
    } catch (error) {
      return { error: 'Network error occurred' };
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
  async applyToJob(jobId: string, applicationData: { jobId: string; coverLetter: string; status: string }): Promise<ApiResponse<JobApplication>> {
    try {
      const endpoint = `${this.baseUrl.replace(/\/$/, '')}/applications`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify({
          jobId: jobId,
          coverLetter: applicationData.coverLetter,
        }),
      });

      console.log('Apply job response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error applying to job:', errorText);
        return { 
          error: `Failed to apply to job: ${response.status} ${response.statusText}`,
          status: response.status 
        };
      }

      return this.handleResponse<JobApplication>(response);
    } catch (error) {
      console.error('Error applying to job:', error);
      return { 
        error: error instanceof Error ? error.message : 'Network error occurred',
        status: 0
      };
    }
  }

  async getApplications(page: number = 1): Promise<ApiResponse<{ results: JobApplication[]; next: string | null; count: number }>> {
    try {
      const response = await fetch(`${this.baseUrl}/applications`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error fetching applications:', errorText);
        return { 
          error: `Failed to fetch applications: ${response.status} ${response.statusText}`,
          status: response.status 
        };
      }

      const applications = await response.json();
      console.log('Applications response:', applications);
      
      // Backend returns applications directly as an array, so we wrap it in the expected format
      return {
        data: {
          results: Array.isArray(applications) ? applications : [],
          next: null,
          count: Array.isArray(applications) ? applications.length : 0
        },
        status: response.status
      };
    } catch (error) {
      console.error('Error fetching applications:', error);
      return { 
        error: 'Network error occurred',
        status: 0
      }
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
  async getSavedJobs(): Promise<ApiResponse<Job[]>> {
    try {
      if (!this.isAuthenticated()) {
        console.error('User is not authenticated');
        return { error: 'User is not authenticated' };
      }

      const endpoint = `${this.baseUrl.replace(/\/$/, '')}/users/me/saved`;
      console.log('Fetching saved jobs from:', endpoint);
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      console.log('Saved jobs response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error fetching saved jobs:', errorText);
        return { 
          error: `Failed to fetch saved jobs: ${response.status} ${response.statusText}`,
          status: response.status 
        };
      }

      const data: Job[] = await response.json();
      console.log('Saved jobs data:', data);
      
      return { 
        data,
        status: response.status 
      };
    } catch (error) {
      console.error('Error in getSavedJobs:', error);
      return { 
        error: error instanceof Error ? error.message : 'Network error occurred',
        status: 0
      };
    }
  }

  async saveJob(jobId: string): Promise<ApiResponse<SavedJob>> {
    try {
      console.log('Saving job with ID:', jobId);
      console.log('Using base URL:', this.baseUrl);
      
      const endpoint = `${this.baseUrl.replace(/\/$/, '')}/users/me/save-job`;
      console.log('Full endpoint:', endpoint);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify({ jobId }),
      });

      console.log('Save job response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Save job error response:', errorText);
        return { 
          error: `Failed to save job: ${response.status} ${response.statusText}`,
          status: response.status 
        };
      }

      return this.handleResponse<SavedJob>(response);
    } catch (error) {
      console.error('Error saving job:', error);
      return { 
        error: error instanceof Error ? error.message : 'Network error occurred',
        status: 0
      };
    }
  }

  async unsaveJob(jobId: string): Promise<ApiResponse> {
    try {
      if (!this.isAuthenticated()) {
        console.error('User is not authenticated');
        return { error: 'User is not authenticated' };
      }

      const url = `${this.baseUrl.replace(/\/$/, '')}/users/me/saved/${jobId}`;
      console.log('Unsaving job with ID:', jobId);
      console.log('Making request to:', url);
      
      const headers = {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders()
      };
      console.log('Request headers:', headers);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: headers,
      });

      console.log('Unsave job response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Unsave job error response:', errorText);
        
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        
        return { 
          error: `Failed to unsave job: ${response.status} ${response.statusText}`,
          status: response.status,
          data: errorText
        };
      }

      // The backend might return the updated list of saved jobs
      const responseData = await response.json();
      console.log('Unsave job successful:', responseData);
      
      return { 
        data: responseData,
        status: response.status 
      };
    } catch (error) {
      console.error('Error unsaving job:', error);
      return { 
        error: error instanceof Error ? error.message : 'Network error occurred',
        status: 0
      };
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