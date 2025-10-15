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

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = (import.meta as any).env?.VITE_CLOUDINARY_CLOUD_NAME || 'your-cloud-name'
const CLOUDINARY_UPLOAD_PRESET = (import.meta as any).env?.VITE_CLOUDINARY_UPLOAD_PRESET || 'your-upload-preset'
const CLOUDINARY_AUDIO_UPLOAD_PRESET = (import.meta as any).env?.VITE_CLOUDINARY_AUDIO_UPLOAD_PRESET || 'da-orbit-audio'

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
    // Add auth token to requests
    const token = localStorage.getItem('da-cms-token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
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

// Cloudinary upload function for images
export const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
  formData.append('cloud_name', CLOUDINARY_CLOUD_NAME)

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )

    if (response.data.secure_url) {
      enqueueSnackbar('Image uploaded successfully!', { variant: 'success' })
      return response.data.secure_url
    } else {
      throw new Error('Upload failed - no URL returned')
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    enqueueSnackbar('Failed to upload image', { variant: 'error' })
    throw error
  }
}

// Cloudinary upload function for audio
export const uploadAudioToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();

  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_AUDIO_UPLOAD_PRESET);
  formData.append('folder', 'da-orbit-audio'); // 👈 ensure uploaded to this folder

  try {
    // ✅ Audio files must use the `video/upload` endpoint
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );

    const { secure_url } = response.data;

    if (secure_url) {
      enqueueSnackbar('🎧 Audio uploaded successfully!', { variant: 'success' });
      return secure_url;
    }

    throw new Error('Upload failed — no secure URL returned from Cloudinary.');
  } catch (error: any) {
    console.error('❌ Cloudinary audio upload error:', error.response?.data || error.message);
    enqueueSnackbar('Failed to upload audio', { variant: 'error' });
    throw error;
  }
};

// Get uploaded images from Cloudinary
export const getUploadedImages = async (options?: { limit?: number; nextCursor?: string }): Promise<{
  images: Array<{ public_id: string; secure_url: string; created_at: string }>;
  nextCursor?: string;
  hasMore: boolean;
}> => {
  try {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.nextCursor) params.append('next_cursor', options.nextCursor);

    const queryString = params.toString();
    const url = `/images${queryString ? `?${queryString}` : ''}`;

    const response: AxiosResponse<{
      images: Array<{ public_id: string; secure_url: string; created_at: string }>;
      next_cursor?: string;
      has_more: boolean;
    }> = await api.get(url);

    return {
      images: response.data.images,
      nextCursor: response.data.next_cursor,
      hasMore: response.data.has_more
    };
  } catch (error) {
    console.error('Failed to fetch uploaded images:', error)
    enqueueSnackbar('Failed to load uploaded images', { variant: 'error' })
    return { images: [], hasMore: false };
  }
}

// Delete image from Cloudinary
export const deleteUploadedImage = async (publicId: string): Promise<{ publicId: string }> => {
  try {
    const response: AxiosResponse<{ message: string; publicId: string }> = await api.delete(`/images/${publicId}`)
    enqueueSnackbar('Image deleted successfully!', { variant: 'success' })
    return response.data
  } catch (error) {
    console.error('Failed to delete uploaded image:', error)
    enqueueSnackbar('Failed to delete image', { variant: 'error' })
    throw error
  }
}

// Get uploaded audios from Cloudinary
export const getUploadedAudios = async (options?: { limit?: number; nextCursor?: string }): Promise<{
  audios: Array<{ public_id: string; secure_url: string; created_at: string }>;
  nextCursor?: string;
  hasMore: boolean;
}> => {
  try {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.nextCursor) params.append('next_cursor', options.nextCursor);

    const queryString = params.toString();
    const url = `/audios${queryString ? `?${queryString}` : ''}`;

    const response: AxiosResponse<{
      audios: Array<{ public_id: string; secure_url: string; created_at: string }>;
      next_cursor?: string;
      has_more: boolean;
    }> = await api.get(url);

    return {
      audios: response.data.audios,
      nextCursor: response.data.next_cursor,
      hasMore: response.data.has_more
    };
  } catch (error) {
    console.error('Failed to fetch uploaded audios:', error)
    enqueueSnackbar('Failed to load uploaded audios', { variant: 'error' })
    return { audios: [], hasMore: false };
  }
}

// Delete audio from Cloudinary
export const deleteUploadedAudio = async (publicId: string): Promise<{ publicId: string }> => {
  try {
    const response: AxiosResponse<{ message: string; publicId: string }> = await api.delete(`/audios/${publicId}`)
    enqueueSnackbar('Audio deleted successfully!', { variant: 'success' })
    return response.data
  } catch (error) {
    console.error('Failed to delete uploaded audio:', error)
    enqueueSnackbar('Failed to delete audio', { variant: 'error' })
    throw error
  }
}