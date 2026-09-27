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
import WorkPlus from '@/pages/worker/WorkPlus'
import WorkerNews from '@/pages/worker/WorkerNews'

// Government pages
import GovLayout from '@/layouts/GovLayout'
import GovDashboard from '@/pages/gov/GovDashboard'
import WorkerMap from '@/pages/gov/WorkerMap'
import WorkerDirectory from '@/pages/gov/WorkerDirectory'
import WelfareAnalytics from '@/pages/gov/WelfareAnalytics'
import WageMonitoring from '@/pages/gov/WageMonitoring'
import GrievancesPanel from '@/pages/gov/GrievancesPanel'
import AIInsights from '@/pages/gov/AIInsights'
import InspectorManagement from '@/pages/gov/InspectorManagement'
import GovReports from '@/pages/gov/GovReports'

// Inspector pages
import InspectorLayout from '@/layouts/InspectorLayout'
import InspectorDashboard from '@/pages/inspector/InspectorDashboard'
import InspectionRoster from '@/pages/inspector/InspectionRoster'
import InspectorCases from '@/pages/inspector/InspectorCases'
import InspectorEvidence from '@/pages/inspector/InspectorEvidence'
import InspectorReports from '@/pages/inspector/InspectorReports'
import InspectorWorkplaces from '@/pages/inspector/InspectorWorkplaces'
import InspectorHelp from '@/pages/inspector/InspectorHelp'

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
          <Route path="workplus" element={<WorkPlus />} />
          <Route path="news" element={<WorkerNews />} />
        </Route>

        {/* Government Official Workspace */}
        <Route
          path="/gov"
          element={
            <ProtectedRoute roles={['official', 'inspector']}>
              <GovLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<GovDashboard />} />
          <Route path="analytics" element={<WelfareAnalytics />} />
          <Route path="map" element={<WorkerMap />} />
          <Route path="workers" element={<WorkerDirectory />} />
          <Route path="inspectors" element={<InspectorManagement />} />
          <Route path="reports" element={<GovReports />} />
          <Route path="welfare" element={<SchemeManagement />} />
          <Route path="wages" element={<WageMonitoring />} />
          <Route path="grievances" element={<GrievancesPanel />} />
          <Route path="insights" element={<AIInsights />} />
          <Route path="settings" element={<SystemSettings />} />
          <Route path="help" element={<AIInsights />} />
        </Route>

        {/* Labour Inspector Workspace (Field Operations & On-Site Enforcement) */}
        <Route
          path="/inspector"
          element={
            <ProtectedRoute roles={['inspector', 'official']}>
              <InspectorLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<InspectorDashboard />} />
          <Route path="roster" element={<InspectionRoster />} />
          <Route path="cases" element={<InspectorCases />} />
          <Route path="evidence" element={<InspectorEvidence />} />
          <Route path="reports" element={<InspectorReports />} />
          <Route path="workplaces" element={<InspectorWorkplaces />} />
          <Route path="help" element={<InspectorHelp />} />
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
