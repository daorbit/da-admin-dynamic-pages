import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Box } from '@mui/material'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import PageList from './pages/PageList'
import PageForm from './pages/PageForm'
import PagePreview from './pages/PagePreview'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100' }}>
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/pages" element={<PageList />} />
                <Route path="/pages/new" element={<PageForm />} />
                <Route path="/pages/edit/:id" element={<PageForm />} />
                <Route path="/pages/preview/:slug" element={<PagePreview />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        </Box>
      </Router>
    </AuthProvider>
  )
}

export default App