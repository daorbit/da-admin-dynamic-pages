import axios, { AxiosResponse } from 'axios'
import { enqueueSnackbar } from 'notistack'
import type { 
  Page, 
  CreatePageData, 
  UpdatePageData, 
  Track,
  CreateTrackData,
  UpdateTrackData,
  Playlist,
  CreatePlaylistData,
  UpdatePlaylistData,
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

// Tracks API functions
export const tracksAPI = {
  // Get all tracks with optional query parameters
  getAll: async (params: Record<string, any> = {}): Promise<PaginatedResponse<Track>> => {
    const response: AxiosResponse<PaginatedResponse<Track>> = await api.get('/tracks', { params })
    return response.data
  },

  // Get track by ID
  getById: async (id: string): Promise<ApiResponse<Track>> => {
    const response: AxiosResponse<ApiResponse<Track>> = await api.get(`/tracks/${id}`)
    return response.data
  },

  // Create new track
  create: async (trackData: CreateTrackData): Promise<ApiResponse<Track>> => {
    const response: AxiosResponse<ApiResponse<Track>> = await api.post('/tracks', trackData)
    enqueueSnackbar('Track created successfully!', { variant: 'success' })
    return response.data
  },

  // Update existing track
  update: async (id: string, trackData: UpdateTrackData): Promise<ApiResponse<Track>> => {
    const response: AxiosResponse<ApiResponse<Track>> = await api.put(`/tracks/${id}`, trackData)
    enqueueSnackbar('Track updated successfully!', { variant: 'success' })
    return response.data
  },

  // Delete track
  delete: async (id: string): Promise<ApiResponse<{ id: string; title: string }>> => {
    const response: AxiosResponse<ApiResponse<{ id: string; title: string }>> = await api.delete(`/tracks/${id}`)
    enqueueSnackbar('Track deleted successfully!', { variant: 'success' })
    return response.data
  },
}

// Playlists API functions
export const playlistsAPI = {
  // Get all playlists with optional query parameters
  getAll: async (params: Record<string, any> = {}): Promise<PaginatedResponse<Playlist>> => {
    const response: AxiosResponse<PaginatedResponse<Playlist>> = await api.get('/playlists', { params })
    return response.data
  },

  // Get playlist by ID
  getById: async (id: string): Promise<ApiResponse<Playlist>> => {
    const response: AxiosResponse<ApiResponse<Playlist>> = await api.get(`/playlists/${id}`)
    return response.data
  },

  // Create new playlist
  create: async (playlistData: CreatePlaylistData): Promise<ApiResponse<Playlist>> => {
    const response: AxiosResponse<ApiResponse<Playlist>> = await api.post('/playlists', playlistData)
    enqueueSnackbar('Playlist created successfully!', { variant: 'success' })
    return response.data
  },

  // Update existing playlist
  update: async (id: string, playlistData: UpdatePlaylistData): Promise<ApiResponse<Playlist>> => {
    const response: AxiosResponse<ApiResponse<Playlist>> = await api.put(`/playlists/${id}`, playlistData)
    enqueueSnackbar('Playlist updated successfully!', { variant: 'success' })
    return response.data
  },

  // Delete playlist
  delete: async (id: string): Promise<ApiResponse<{ id: string; title: string }>> => {
    const response: AxiosResponse<ApiResponse<{ id: string; title: string }>> = await api.delete(`/playlists/${id}`)
    enqueueSnackbar('Playlist deleted successfully!', { variant: 'success' })
    return response.data
  },

  // Add tracks to playlist
  addTracks: async (id: string, trackIds: string[]): Promise<ApiResponse<Playlist>> => {
    const response: AxiosResponse<ApiResponse<Playlist>> = await api.put(`/playlists/${id}/tracks`, { trackIds })
    enqueueSnackbar('Tracks added to playlist successfully!', { variant: 'success' })
    return response.data
  },

  // Remove track from playlist
  removeTrack: async (id: string, trackId: string): Promise<ApiResponse<Playlist>> => {
    const response: AxiosResponse<ApiResponse<Playlist>> = await api.delete(`/playlists/${id}/tracks/${trackId}`)
    enqueueSnackbar('Track removed from playlist successfully!', { variant: 'success' })
    return response.data
  },
}

export default api