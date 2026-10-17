import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminSidebar } from './components/AdminSidebar';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { FeaturesPage } from './pages/FeaturesPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { SecurityPage } from './pages/SecurityPage';
import { LoginPage } from './pages/LoginPage';

// Candidate Portal
import { CandidatePortal } from './pages/CandidatePortal';

// Recruiter Admin Command Center Pages
import { DashboardOverview } from './pages/admin/DashboardOverview';
import { CampaignsList } from './pages/admin/CampaignsList';
import { CampaignWizard } from './pages/admin/CampaignWizard';
import { CampaignDetail } from './pages/admin/CampaignDetail';
import { CandidatesList } from './pages/admin/CandidatesList';
import { CandidateDetail } from './pages/admin/CandidateDetail';
import { InvitationsManager } from './pages/admin/InvitationsManager';
import { InterviewsMonitor } from './pages/admin/InterviewsMonitor';
import { AssessmentsList } from './pages/admin/AssessmentsList';
import { HumanReviewQueue } from './pages/admin/HumanReviewQueue';
import { CampaignAnalytics } from './pages/admin/CampaignAnalytics';
import { ReportsExport } from './pages/admin/ReportsExport';
import { AuditLogViewer } from './pages/admin/AuditLogViewer';
import { SettingsPage } from './pages/admin/SettingsPage';

// Protected Admin Layout
const AdminLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 text-xs font-mono">Loading authentication context...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Marketing Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/security" element={<SecurityPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Isolated Candidate Portal Experience */}
          <Route path="/interview/:invitationToken" element={<CandidatePortal />} />

          {/* Authenticated Recruiter Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardOverview />} />
            <Route path="campaigns" element={<CampaignsList />} />
            <Route path="campaigns/new" element={<CampaignWizard />} />
            <Route path="campaigns/:id" element={<CampaignDetail />} />
            <Route path="candidates" element={<CandidatesList />} />
            <Route path="candidates/:id" element={<CandidateDetail />} />
            <Route path="invitations" element={<InvitationsManager />} />
            <Route path="interviews" element={<InterviewsMonitor />} />
            <Route path="assessments" element={<AssessmentsList />} />
            <Route path="reviews" element={<HumanReviewQueue />} />
            <Route path="analytics" element={<CampaignAnalytics />} />
            <Route path="reports" element={<Navigate to="/admin/analytics" replace />} />
            <Route path="audit" element={<Navigate to="/admin/settings" replace />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
