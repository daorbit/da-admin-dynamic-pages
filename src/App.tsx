import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Box } from '@mui/material'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import PageList from './pages/PageList'
import PageForm from './pages/PageForm'
import PagePreview from './pages/PagePreview'
import TrackList from './pages/TrackList'
import TrackForm from './pages/TrackForm'
import PlaylistList from './pages/PlaylistList'
import PlaylistForm from './pages/PlaylistForm'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Box sx={{ minHeight: '100vh'}}>
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/pages" element={<PageList />} />
                <Route path="/pages/new" element={<PageForm />} />
                <Route path="/pages/edit/:id" element={<PageForm />} />
                <Route path="/pages/preview/:slug" element={<PagePreview />} />
                <Route path="/tracks" element={<TrackList />} />
                <Route path="/tracks/new" element={<TrackForm />} />
                <Route path="/tracks/:id/edit" element={<TrackForm />} />
                <Route path="/playlists" element={<PlaylistList />} />
                <Route path="/playlists/new" element={<PlaylistForm />} />
                <Route path="/playlists/:id/edit" element={<PlaylistForm />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        </Box>
      </Router>
    </AuthProvider>
  )
}

export default App