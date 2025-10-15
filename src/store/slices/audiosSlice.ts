import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getUploadedAudios, deleteUploadedAudio, updateAudioName } from '../../services/api'
import type { Audio } from '../../types'

interface AudiosState {
  items: Audio[]
  loading: boolean
  loadingMore: boolean
  updating: string | null // public_id of audio being updated
  error: string | null
  lastFetched: number | null // timestamp for caching
  nextCursor: string | null
  hasMore: boolean
}

const initialState: AudiosState = {
  items: [],
  loading: false,
  loadingMore: false,
  updating: null,
  error: null,
  lastFetched: null,
  nextCursor: null,
  hasMore: false,
}

// Async thunk to fetch uploaded audios
export const fetchAudios = createAsyncThunk(
  'audios/fetchAudios',
  async () => {
    const result = await getUploadedAudios({ limit: 10 })
    return result
  }
)

// Async thunk to load more audios
export const loadMoreAudios = createAsyncThunk(
  'audios/loadMoreAudios',
  async (nextCursor: string) => {
    const result = await getUploadedAudios({ limit: 10, nextCursor })
    return result
  }
)

// Async thunk to delete an audio
export const deleteAudio = createAsyncThunk(
  'audios/deleteAudio',
  async (publicId: string) => {
    await deleteUploadedAudio(publicId)
    return publicId
  }
)

// Async thunk to update audio name
export const updateAudio = createAsyncThunk(
  'audios/updateAudio',
  async ({ publicId, name }: { publicId: string; name: string }) => {
    const result = await updateAudioName(publicId, name)
    return { publicId, name: result.name }
  }
)

// Remove audio locally (for optimistic updates)
export const removeAudioLocally = createAsyncThunk(
  'audios/removeAudioLocally',
  async (publicId: string) => {
    return publicId
  }
)

const audiosSlice = createSlice({
  name: 'audios',
  initialState,
  reducers: {
    clearAudios: (state) => {
      state.items = []
      state.lastFetched = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAudios.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAudios.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.audios
        state.nextCursor = action.payload.nextCursor || null
        state.hasMore = action.payload.hasMore
        state.lastFetched = Date.now()
      })
      .addCase(fetchAudios.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch audios'
      })
      .addCase(loadMoreAudios.pending, (state) => {
        state.loadingMore = true
        state.error = null
      })
      .addCase(loadMoreAudios.fulfilled, (state, action) => {
        state.loadingMore = false
        state.items = [...state.items, ...action.payload.audios]
        state.nextCursor = action.payload.nextCursor || null
        state.hasMore = action.payload.hasMore
      })
      .addCase(loadMoreAudios.rejected, (state, action) => {
        state.loadingMore = false
        state.error = action.error.message || 'Failed to load more audios'
      })
      .addCase(deleteAudio.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteAudio.fulfilled, (state, action) => {
        state.loading = false
        state.items = state.items.filter(audio => audio.public_id !== action.payload)
      })
      .addCase(deleteAudio.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to delete audio'
      })
      .addCase(removeAudioLocally.fulfilled, (state, action) => {
        state.items = state.items.filter(audio => audio.public_id !== action.payload)
      })
      .addCase(updateAudio.pending, (state, action) => {
        state.updating = action.meta.arg.publicId
        state.error = null
      })
      .addCase(updateAudio.fulfilled, (state, action) => {
        state.updating = null
        const { publicId, name } = action.payload
        const audioIndex = state.items.findIndex(audio => audio.public_id === publicId)
        if (audioIndex !== -1) {
          state.items[audioIndex] = { ...state.items[audioIndex], name }
        }
      })
      .addCase(updateAudio.rejected, (state, action) => {
        state.updating = null
        state.error = action.error.message || 'Failed to update audio name'
      })
  },
})

export const { clearAudios } = audiosSlice.actions
export default audiosSlice.reducer