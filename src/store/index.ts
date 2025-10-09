import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'
import pagesSlice from './slices/pagesSlice'
import dashboardSlice from './slices/dashboardSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    pages: pagesSlice,
    dashboard: dashboardSlice,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch