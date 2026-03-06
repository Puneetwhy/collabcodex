import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/common/ProtectedRoute'

import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import ProjectDetail from './pages/ProjectDetail'
import ProjectSettings from './pages/ProjectSettings'
import NotFound from './pages/NotFound'

function App() {
  return (
    <Routes>

      
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects/:projectId" element={<ProjectDetail />} />
        <Route
          path="/projects/:projectId/settings"
          element={<ProjectSettings />}
        />
      </Route>

      
      <Route path="*" element={<NotFound />} />

    </Routes>
  )
}

export default App