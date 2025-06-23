import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import PrivateRoute from "@/components/PrivateRoute";
import Layout from "@/components/Layout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Patients from "@/pages/Patients";
import Orders from "@/pages/Orders";
import Samples from "@/pages/Samples";
import Doctors from "@/pages/Doctors";
import Staff from "@/pages/Staff";
import Analytics from "@/pages/Analytics";
import Settings from "@/pages/Settings";
import Tests from "@/pages/Tests";
import NotFound from "./pages/NotFound";
import EntityDetail from './pages/EntityDetail';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </PrivateRoute>
              } />
              <Route path="/patients" element={
                <PrivateRoute roles={['ADMIN', 'LAB_TECH', 'RECEPTIONIST']}>
                  <Layout>
                    <Patients />
                  </Layout>
                </PrivateRoute>
              } />
              <Route path="/orders" element={
                <PrivateRoute roles={['ADMIN', 'LAB_TECH', 'PATHOLOGIST', 'RECEPTIONIST']}>
                  <Layout>
                    <Orders />
                  </Layout>
                </PrivateRoute>
              } />
              <Route path="/samples" element={
                <PrivateRoute roles={['ADMIN', 'LAB_TECH', 'PATHOLOGIST']}>
                  <Layout>
                    <Samples />
                  </Layout>
                </PrivateRoute>
              } />
              <Route path="/reports" element={
                <PrivateRoute roles={['ADMIN', 'LAB_TECH', 'PATHOLOGIST', 'DOCTOR']}>
                  <Layout>
                    <div className="p-6">
                      <h1 className="text-2xl font-bold">Lab Reports</h1>
                      <p className="text-gray-600 mt-2">Coming soon...</p>
                    </div>
                  </Layout>
                </PrivateRoute>
              } />
              <Route path="/doctors" element={
                <PrivateRoute roles={['ADMIN', 'RECEPTIONIST']}>
                  <Layout>
                    <Doctors />
                  </Layout>
                </PrivateRoute>
              } />
              <Route path="/staff" element={
                <PrivateRoute roles={['ADMIN']}>
                  <Layout>
                    <Staff />
                  </Layout>
                </PrivateRoute>
              } />
              <Route path="/analytics" element={
                <PrivateRoute roles={['ADMIN', 'PATHOLOGIST']}>
                  <Layout>
                    <Analytics />
                  </Layout>
                </PrivateRoute>
              } />
              <Route path="/tests" element={
                <PrivateRoute roles={['ADMIN']}>
                  <Layout>
                    <Tests />
                  </Layout>
                </PrivateRoute>
              } />
              <Route path="/settings" element={
                <PrivateRoute roles={['ADMIN']}>
                  <Layout>
                    <Settings />
                  </Layout>
                </PrivateRoute>
              } />
              <Route path="/:entity/:id" element={<EntityDetail />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;