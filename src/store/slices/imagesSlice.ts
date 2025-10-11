import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getUploadedImages, deleteUploadedImage } from '../../services/api'
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

// Async thunk to delete an image
export const deleteImage = createAsyncThunk(
  'images/deleteImage',
  async (publicId: string) => {
    await deleteUploadedImage(publicId)
    return publicId
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
      .addCase(deleteImage.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteImage.fulfilled, (state, action) => {
        state.loading = false
        state.items = state.items.filter(image => image.public_id !== action.payload)
      })
      .addCase(deleteImage.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to delete image'
      })
  },
})

export const { clearImages } = imagesSlice.actions
export default imagesSlice.reducer