import axios, { AxiosResponse } from 'axios'
import { enqueueSnackbar } from 'notistack'
import type { 
  Page, 
  CreatePageData, 
  UpdatePageData, 
  PaginatedResponse, 
  ApiResponse 
} from '../types'

// Create axios instance with default config
const api = axios.create({
  baseURL: 'https://da-pages-be.vercel.app/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // You can add auth tokens here later
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const message = error.response?.data?.message || 'An error occurred'
    
    // Don't show snackbar for 404 errors when fetching individual items
    if (error.response?.status !== 404) {
      enqueueSnackbar(message, { variant: 'error' })
    }
    
    return Promise.reject(error)
  }
)

// Pages API functions
export const pagesAPI = {
  // Get all pages with optional query parameters
  getAll: async (params: Record<string, any> = {}): Promise<PaginatedResponse<Page>> => {
    const response: AxiosResponse<PaginatedResponse<Page>> = await api.get('/pages', { params })
    return response.data
  },

  // Get page by slug
  getBySlug: async (slug: string): Promise<ApiResponse<Page>> => {
    const response: AxiosResponse<ApiResponse<Page>> = await api.get(`/pages/${slug}`)
    return response.data
  },

  // Get page by ID (for editing)
  getById: async (id: string): Promise<ApiResponse<Page>> => {
    const response: AxiosResponse<ApiResponse<Page>> = await api.get(`/pages/by-id/${id}`)
    return response.data
  },

  // Create new page
  create: async (pageData: CreatePageData): Promise<ApiResponse<Page>> => {
    const response: AxiosResponse<ApiResponse<Page>> = await api.post('/pages', pageData)
    enqueueSnackbar('Page created successfully!', { variant: 'success' })
    return response.data
  },

  // Update existing page
  update: async (id: string, pageData: UpdatePageData): Promise<ApiResponse<Page>> => {
    const response: AxiosResponse<ApiResponse<Page>> = await api.put(`/pages/${id}`, pageData)
    enqueueSnackbar('Page updated successfully!', { variant: 'success' })
    return response.data
  },

  // Delete page
  delete: async (id: string): Promise<ApiResponse<{ id: string; title: string }>> => {
    const response: AxiosResponse<ApiResponse<{ id: string; title: string }>> = await api.delete(`/pages/${id}`)
    enqueueSnackbar('Page deleted successfully!', { variant: 'success' })
    return response.data
  },
}

export default api