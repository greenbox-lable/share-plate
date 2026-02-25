import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Donate from "./pages/Donate";
import Receive from "./pages/Receive";
import Volunteer from "./pages/Volunteer";
import Auth from "./pages/Auth";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import DonorDashboard from "./pages/DonorDashboard";
import VolunteerDashboard from "./pages/VolunteerDashboard";
import ReceiverDashboard from "./pages/ReceiverDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />

            {/* Protected routes - require login */}
            <Route path="/donate" element={
              <ProtectedRoute allowedRole="donor">
                <Donate />
              </ProtectedRoute>
            } />
            <Route path="/receive" element={
              <ProtectedRoute allowedRole="ngo">
                <Receive />
              </ProtectedRoute>
            } />
            <Route path="/volunteer" element={
              <ProtectedRoute allowedRole="volunteer">
                <Volunteer />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute allowedRole="admin">
                <Admin />
              </ProtectedRoute>
            } />
            <Route path="/donor/dashboard" element={
              <ProtectedRoute allowedRole="donor">
                <DonorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/volunteer/dashboard" element={
              <ProtectedRoute allowedRole="volunteer">
                <VolunteerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/receiver/dashboard" element={
              <ProtectedRoute allowedRole="ngo">
                <ReceiverDashboard />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
