import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Test connection to backend
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/health')
        setMessage(response.data.message || 'Connected to backend!')
      } catch (error) {
        setMessage('Backend connection failed')
        console.error('Error connecting to backend:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <h1>DA Admin Dynamic Pages</h1>
        <p>Vite + React Frontend</p>
        <div className="status">
          {loading ? (
            <p>Connecting to backend...</p>
          ) : (
            <p>Backend Status: {message}</p>
          )}
        </div>
      </header>
    </div>
  )
}

export default App