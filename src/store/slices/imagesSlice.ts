import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getUploadedImages } from '../../services/api'
import type { Image } from '../../types'

interface ImagesState {
  items: Image[]
  loading: boolean
  error: string | null
  lastFetched: number | null // timestamp for caching
}

const initialState: ImagesState = {
  items: [],
  loading: false,
  error: null,
  lastFetched: null,
}

// Async thunk to fetch uploaded images
export const fetchImages = createAsyncThunk(
  'images/fetchImages',
  async () => {
    const images = await getUploadedImages()
    return images
  }
)

const imagesSlice = createSlice({
  name: 'images',
  initialState,
  reducers: {
    clearImages: (state) => {
      state.items = []
      state.lastFetched = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchImages.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchImages.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
        state.lastFetched = Date.now()
      })
      .addCase(fetchImages.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch images'
      })
  },
})

export const { clearImages } = imagesSlice.actions
export default imagesSlice.reducer