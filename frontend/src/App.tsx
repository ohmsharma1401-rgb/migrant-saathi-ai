import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Public pages
import LandingPage from '@/pages/public/LandingPage'
import RoleSelection from '@/pages/public/RoleSelection'
import WorkerLogin from '@/pages/public/WorkerLogin'
import OfficialLogin from '@/pages/public/OfficialLogin'

// Worker pages
import WorkerLayout from '@/layouts/WorkerLayout'
import WorkerDashboard from '@/pages/worker/WorkerDashboard'
import WorkerProfile from '@/pages/worker/WorkerProfile'
import WorkerSkills from '@/pages/worker/WorkerSkills'
import WelfareBenefits from '@/pages/worker/WelfareBenefits'
import WageCheck from '@/pages/worker/WageCheck'
import ReportSafety from '@/pages/worker/ReportSafety'
import MyGrievances from '@/pages/worker/MyGrievances'
import AIAssistant from '@/pages/worker/AIAssistant'

// Government pages
import GovLayout from '@/layouts/GovLayout'
import GovDashboard from '@/pages/gov/GovDashboard'
import WorkerMap from '@/pages/gov/WorkerMap'
import WorkerDirectory from '@/pages/gov/WorkerDirectory'
import WelfareAnalytics from '@/pages/gov/WelfareAnalytics'
import WageMonitoring from '@/pages/gov/WageMonitoring'
import GrievancesPanel from '@/pages/gov/GrievancesPanel'
import AIInsights from '@/pages/gov/AIInsights'

// Admin pages
import AdminLayout from '@/layouts/AdminLayout'
import UserManagement from '@/pages/admin/UserManagement'
import SchemeManagement from '@/pages/admin/SchemeManagement'
import ReferenceWages from '@/pages/admin/ReferenceWages'
import SystemSettings from '@/pages/admin/SystemSettings'

import ProtectedRoute from '@/components/auth/ProtectedRoute'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/select-role" element={<RoleSelection />} />
        <Route path="/login/worker" element={<WorkerLogin />} />
        <Route path="/login/official" element={<OfficialLogin />} />

        {/* Worker */}
        <Route
          path="/worker"
          element={
            <ProtectedRoute roles={['worker']}>
              <WorkerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<WorkerDashboard />} />
          <Route path="profile" element={<WorkerProfile />} />
          <Route path="skills" element={<WorkerSkills />} />
          <Route path="welfare" element={<WelfareBenefits />} />
          <Route path="wages" element={<WageCheck />} />
          <Route path="report" element={<ReportSafety />} />
          <Route path="grievances" element={<MyGrievances />} />
          <Route path="ai" element={<AIAssistant />} />
        </Route>

        {/* Government */}
        <Route
          path="/gov"
          element={
            <ProtectedRoute roles={['official', 'inspector']}>
              <GovLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<GovDashboard />} />
          <Route path="map" element={<WorkerMap />} />
          <Route path="workers" element={<WorkerDirectory />} />
          <Route path="welfare" element={<WelfareAnalytics />} />
          <Route path="wages" element={<WageMonitoring />} />
          <Route path="grievances" element={<GrievancesPanel />} />
          <Route path="insights" element={<AIInsights />} />
        </Route>

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<UserManagement />} />
          <Route path="schemes" element={<SchemeManagement />} />
          <Route path="wages" element={<ReferenceWages />} />
          <Route path="settings" element={<SystemSettings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
