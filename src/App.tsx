import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense, type ReactNode } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AppErrorBoundary from "@/components/AppErrorBoundary";
import DashboardLayout from "@/components/DashboardLayout";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import Landing from "./pages/Landing";
import Onboarding from "./pages/Onboarding";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const VocabularyPack = lazy(() => import("./pages/VocabularyPack"));
const Dictionary = lazy(() => import("./pages/Dictionary"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Profile = lazy(() => import("./pages/Profile"));
const AssessmentExam = lazy(() => import("./pages/AssessmentExam"));
const PracticeView = lazy(() => import("./components/PracticeView"));

function RouteFallback() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <LoadingSpinner size="md" message="Dang tai..." />
    </div>
  );
}

function AuthenticatedRoute({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/" />;
  return <DashboardLayout>{children}</DashboardLayout>;
}

function AppRoutes() {
  const { isLoggedIn, hasOnboarded, isNewUser } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route
        path="/"
        element={
          !isLoggedIn ? <Landing /> : (isNewUser && !hasOnboarded) ? <Navigate to="/onboarding" /> : <Navigate to="/home" />
        }
      />
      <Route
        path="/onboarding"
        element={isLoggedIn && !hasOnboarded ? <Onboarding /> : <Navigate to="/home" />}
      />
      <Route
        path="/dictionary"
        element={
          isLoggedIn ? (
            <AuthenticatedRoute><Dictionary /></AuthenticatedRoute>
          ) : (
            <Dictionary publicMode />
          )
        }
      />

      {/* Authenticated routes with DashboardLayout */}
      <Route path="/home" element={<AuthenticatedRoute><Home /></AuthenticatedRoute>} />
      <Route path="/courses" element={<AuthenticatedRoute><VocabularyPack /></AuthenticatedRoute>} />
      <Route path="/ai-recognition" element={<AuthenticatedRoute><PracticeView /></AuthenticatedRoute>} />
      <Route path="/assessment" element={<AuthenticatedRoute><AssessmentExam /></AuthenticatedRoute>} />
      <Route path="/leaderboard" element={<AuthenticatedRoute><Leaderboard /></AuthenticatedRoute>} />
      <Route path="/profile" element={<AuthenticatedRoute><Profile /></AuthenticatedRoute>} />

      {/* Legacy redirects */}
      <Route path="/dashboard" element={<Navigate to="/home" replace />} />
      <Route path="/course-map" element={<Navigate to="/courses" replace />} />
      <Route path="/practice-exam" element={<Navigate to="/assessment" replace />} />

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
          <AppErrorBoundary>
            <Suspense fallback={<RouteFallback />}>
              <AppRoutes />
            </Suspense>
          </AppErrorBoundary>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
