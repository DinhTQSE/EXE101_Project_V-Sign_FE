import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Landing from "./pages/Landing";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { isLoggedIn, hasOnboarded, isNewUser } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={
          !isLoggedIn ? <Landing /> : (isNewUser && !hasOnboarded) ? <Navigate to="/onboarding" /> : <Navigate to="/dashboard" />
        }
      />
      <Route
        path="/onboarding"
        element={isLoggedIn && !hasOnboarded ? <Onboarding /> : <Navigate to="/dashboard" />}
      />
      <Route
        path="/dashboard"
        element={isLoggedIn ? <Dashboard /> : <Navigate to="/" />}
      />
      <Route
        path="/course-map"
        element={<Navigate to="/dashboard" />}
      />
      <Route
        path="/profile"
        element={isLoggedIn ? <Dashboard defaultTab="profile" /> : <Navigate to="/" />}
      />
      <Route
        path="/mock-exam"
        element={isLoggedIn ? <Dashboard defaultTab="mock-exam" /> : <Navigate to="/" />}
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
