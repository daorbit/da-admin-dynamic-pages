import React, { useEffect } from 'react'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Paper,
  Chip,
} from '@mui/material'
import {
  Article as ArticleIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchDashboardData } from '../store/slices/dashboardSlice'

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch()
  const { recentPages, totalPages, healthStatus, loading, error, lastFetched } = useAppSelector(
    (state) => state.dashboard
  )

  useEffect(() => {
    // Only fetch if we haven't fetched in the last 5 minutes (300000 ms)
    const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
    const shouldFetch = !lastFetched || (Date.now() - lastFetched) > CACHE_DURATION

    if (shouldFetch) {
      dispatch(fetchDashboardData())
    }
  }, [dispatch, lastFetched])

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    )
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total Pages Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <ArticleIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  Total Pages
                </Typography>
                <Typography variant="h4">
                  {totalPages}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* System Status Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUpIcon color="success" sx={{ fontSize: 40, mr: 2 }} />
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  System Status
                </Typography>
                <Chip 
                  label={healthStatus?.status || 'Unknown'} 
                  color={healthStatus?.status === 'OK' ? 'success' : 'error'}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Uptime Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <ScheduleIcon color="info" sx={{ fontSize: 40, mr: 2 }} />
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  Server Uptime
                </Typography>
                <Typography variant="h6">
                  {healthStatus?.uptime ? `${Math.floor(healthStatus.uptime / 60)} min` : 'N/A'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Pages */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Recent Pages
        </Typography>
        
        {recentPages.length === 0 ? (
          <Typography color="textSecondary">
            No pages found. Create your first page!
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {recentPages.map((page) => (
              <Grid item xs={12} sm={6} md={4} key={page._id}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {page.title}
                    </Typography>
                    <Typography color="textSecondary" variant="body2" paragraph>
                      {page.description.substring(0, 100)}
                      {page.description.length > 100 && '...'}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                      {page.groups.slice(0, 3).map((group, index) => (
                        <Chip key={index} label={group} size="small" />
                      ))}
                      {page.groups.length > 3 && (
                        <Chip label={`+${page.groups.length - 3} more`} size="small" variant="outlined" />
                      )}
                    </Box>
                    <Typography variant="caption" color="textSecondary">
                      Created: {new Date(page.createdAt).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Box>
  )
}

export default Dashboard