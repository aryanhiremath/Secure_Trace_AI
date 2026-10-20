
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import DocumentsPage from './pages/DocumentsPage'
import SharingPage from './pages/SharingPage'
import AuditTrailPage from './pages/AuditTrailPage'
import TeamsPage from './pages/TeamsPage'
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/sharing" element={<SharingPage />} />
        <Route path="/audit" element={<AuditTrailPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
        <Route path="/teams" element={<TeamsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
