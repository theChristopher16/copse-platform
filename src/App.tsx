import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CopseProvider } from './contexts/CopseContext';
import { AdminProvider } from './contexts/AdminContext';
import { MultiTenantProvider } from './contexts/MultiTenantContext';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';

// Components
import Layout from './components/Layout/Layout';
import { AdminOnly, RootOnly, AuthenticatedOnly } from './components/Auth/RoleGuard';
import AuthGuard from './components/Auth/AuthGuard';

// Pages
import HomePage from './pages/HomePage';
import CopseHomePage from './pages/CopseHomePage';
import EventsPage from './pages/EventsPage';
import LocationsPage from './pages/LocationsPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import ResourcesPage from './pages/ResourcesPage';
import VolunteerPage from './pages/VolunteerPage';
import EcologyPage from './pages/EcologyPage';
import FeedbackPage from './pages/FeedbackPage';
import DataAuditPage from './pages/DataAuditPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import AnalyticsDashboard from './components/Analytics/AnalyticsDashboard';
import AnalyticsTest from './components/Analytics/AnalyticsTest';
import FormsDemoPage from './pages/FormsDemoPage';
import CloudFunctionsTestPage from './pages/CloudFunctionsTestPage';
import NotFoundPage from './pages/NotFoundPage';
import EventDetailPage from './pages/EventDetailPage';
import TestNavigation from './pages/TestNavigation';
import AuthDebugPage from './pages/AuthDebugPage';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminEvents from './pages/AdminEvents';
import AdminLocations from './pages/AdminLocations';
import AdminAnnouncements from './pages/AdminAnnouncements';
import UnifiedChat from './components/Chat/UnifiedChat';
import AdminAI from './pages/AdminAI';
import AdminPermissionsAudit from './pages/AdminPermissionsAudit';
import AdminUsers from './pages/AdminUsers';
import AdminVolunteer from './pages/AdminVolunteer';
import AdminReminders from './pages/AdminReminders';
import AdminCostManagement from './pages/AdminCostManagement';
import AdminSettings from './pages/AdminSettings';
import AdminSeasons from './pages/AdminSeasons';
import AdminLists from './pages/AdminLists';
import AdminFinances from './pages/AdminFinances';
import AdminFundraising from './pages/AdminFundraising';
import MultiTenantManagement from './pages/MultiTenantManagement';

// System Pages
import HackerTab from './pages/HackerTab';
import DatabaseMonitor from './components/Admin/DatabaseMonitor';
import SystemMonitor from './components/Admin/SystemMonitor';
import PerformanceMonitor from './components/Performance/PerformanceMonitor';
import RootAccountSetup from './components/Auth/RootAccountSetup';
import UserProfile from './pages/UserProfile';
import JoinPage from './pages/JoinPage';

function App() {
  useEffect(() => {
    console.log('🌳 Copse Platform - Multi-tenant application starting...');
  }, []);

  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <AdminProvider>
            <MultiTenantProvider>
              <CopseProvider>
                <AuthGuard>
                <Router>
                  <ScrollToTop />
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Layout><CopseHomePage /></Layout>} />
                    <Route path="/pack1703" element={<Layout><HomePage /></Layout>} />
                    <Route path="/events" element={<Layout><EventsPage /></Layout>} />
                    <Route path="/events/:eventId" element={<Layout><EventDetailPage /></Layout>} />
                    <Route path="/test-navigation" element={<TestNavigation />} />
                    <Route path="/auth-debug" element={<AuthDebugPage />} />
                    <Route path="/locations" element={<Layout><LocationsPage /></Layout>} />
                    <Route path="/announcements" element={<Layout><AnnouncementsPage /></Layout>} />
                    <Route path="/resources" element={<Layout><ResourcesPage /></Layout>} />
                    <Route path="/volunteer" element={<Layout><VolunteerPage /></Layout>} />
                    <Route path="/ecology" element={<Layout><EcologyPage /></Layout>} />
                    <Route path="/privacy" element={<Layout><PrivacyPolicyPage /></Layout>} />
                    <Route path="/terms" element={<Layout><TermsOfServicePage /></Layout>} />
                    <Route path="/join/:inviteId" element={<JoinPage />} />
                    
                    {/* Authenticated Routes */}
                    <Route path="/chat" element={<Layout><AuthenticatedOnly><UnifiedChat /></AuthenticatedOnly></Layout>} />
                    <Route path="/feedback" element={<Layout><AuthenticatedOnly><FeedbackPage /></AuthenticatedOnly></Layout>} />
                    <Route path="/data-audit" element={<Layout><AuthenticatedOnly><DataAuditPage /></AuthenticatedOnly></Layout>} />
                    
                    {/* Admin Routes */}
                    <Route path="/analytics" element={<Layout><AdminOnly><AnalyticsDashboard /></AdminOnly></Layout>} />
                    <Route path="/analytics/test" element={<Layout><AdminOnly><AnalyticsTest /></AdminOnly></Layout>} />
                    <Route path="/admin" element={<Layout><AdminOnly><AdminDashboard /></AdminOnly></Layout>} />
                    <Route path="/admin/events" element={<Layout><AdminOnly><AdminEvents /></AdminOnly></Layout>} />
                    <Route path="/admin/locations" element={<Layout><AdminOnly><AdminLocations /></AdminOnly></Layout>} />
                    <Route path="/admin/announcements" element={<Layout><AdminOnly><AdminAnnouncements /></AdminOnly></Layout>} />
                    <Route path="/admin/chat" element={<Layout><AdminOnly><UnifiedChat /></AdminOnly></Layout>} />
                    <Route path="/admin/ai" element={<Layout><AdminOnly><AdminAI /></AdminOnly></Layout>} />
                    <Route path="/admin/permissions" element={<Layout><AdminOnly><AdminPermissionsAudit /></AdminOnly></Layout>} />
                    <Route path="/admin/users" element={<Layout><AdminOnly><AdminUsers /></AdminOnly></Layout>} />
                    <Route path="/admin/volunteer" element={<Layout><AdminOnly><AdminVolunteer /></AdminOnly></Layout>} />
                    <Route path="/admin/reminders" element={<Layout><AdminOnly><AdminReminders /></AdminOnly></Layout>} />
                    <Route path="/admin/cost" element={<Layout><AdminOnly><AdminCostManagement /></AdminOnly></Layout>} />
                    <Route path="/admin/settings" element={<Layout><AdminOnly><AdminSettings /></AdminOnly></Layout>} />
                    <Route path="/admin/seasons" element={<Layout><AdminOnly><AdminSeasons /></AdminOnly></Layout>} />
                    <Route path="/admin/lists" element={<Layout><AdminOnly><AdminLists /></AdminOnly></Layout>} />
                    <Route path="/admin/finances" element={<Layout><AdminOnly><AdminFinances /></AdminOnly></Layout>} />
                    <Route path="/admin/fundraising" element={<Layout><AdminOnly><AdminFundraising /></AdminOnly></Layout>} />
                    <Route path="/multi-tenant" element={<Layout><RootOnly><MultiTenantManagement /></RootOnly></Layout>} />

                    <Route path="/profile" element={<Layout><AuthenticatedOnly><UserProfile /></AuthenticatedOnly></Layout>} />
                    <Route path="/soc" element={<Layout><RootOnly><HackerTab /></RootOnly></Layout>} />
                    <Route path="/database" element={<Layout><RootOnly><DatabaseMonitor /></RootOnly></Layout>} />
                    <Route path="/system" element={<Layout><RootOnly><SystemMonitor /></RootOnly></Layout>} />
                    <Route path="/performance" element={<Layout><RootOnly><PerformanceMonitor /></RootOnly></Layout>} />
                    <Route path="/root-setup" element={<RootAccountSetup />} />
                    
                    {/* Development/Test Routes */}
                    <Route path="/forms-demo" element={<Layout><FormsDemoPage /></Layout>} />
                    <Route path="/cloud-functions-test" element={<Layout><CloudFunctionsTestPage /></Layout>} />
                    
                    <Route path="*" element={<Layout><NotFoundPage /></Layout>} />
                  </Routes>
                </Router>
                </AuthGuard>
              </CopseProvider>
            </MultiTenantProvider>
          </AdminProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;