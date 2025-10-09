import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { pagesAPI, healthCheck } from '../../services/api'
import type { Page, HealthResponse } from '../../types'

interface DashboardState {
  recentPages: Page[]
  totalPages: number
  healthStatus: HealthResponse | null
  loading: boolean
  error: string | null
  lastFetched: number | null // timestamp for caching
}

const initialState: DashboardState = {
  recentPages: [],
  totalPages: 0,
  healthStatus: null,
  loading: false,
  error: null,
  lastFetched: null,
}

// Async thunk to fetch dashboard data
export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchDashboardData',
  async () => {
    const [pagesResponse, health] = await Promise.all([
      pagesAPI.getAll({ limit: 5, page: 1 }),
      healthCheck()
    ])

    return {
      recentPages: pagesResponse.data.pages,
      totalPages: pagesResponse.data.pagination.totalItems,
      healthStatus: health,
    }
  }
)

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboardData: (state) => {
      state.recentPages = []
      state.totalPages = 0
      state.healthStatus = null
      state.lastFetched = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false
        state.recentPages = action.payload.recentPages
        state.totalPages = action.payload.totalPages
        state.healthStatus = action.payload.healthStatus
        state.lastFetched = Date.now()
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch dashboard data'
      })
  },
})

export const { clearDashboardData } = dashboardSlice.actions
export default dashboardSlice.reducer