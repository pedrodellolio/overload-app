import { Route, Switch } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Dock } from "./components/Dock";
import { Login } from "./pages/Login";
import { Workouts } from "./pages/Workouts";
import { History } from "./pages/History";
import { Home } from "./pages/Home";
import { Stats } from "./pages/Stats";
import { WorkoutRegistration } from "./pages/WorkoutRegistration";
import { SessionView } from "./pages/SessionView";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/">
            <ProtectedRoute>
              <div className="h-full bg-base-100 flex flex-col">
                <div className="flex-1 overflow-y-auto">
                  <Home />
                </div>
                <Dock />
              </div>
            </ProtectedRoute>
          </Route>
          <Route path="/workouts">
            <ProtectedRoute>
              <div className="h-full bg-base-100 flex flex-col">
                <div className="flex-1 overflow-y-auto">
                  <Workouts />
                </div>
                <Dock />
              </div>
            </ProtectedRoute>
          </Route>
          <Route path="/history">
            <ProtectedRoute>
              <div className="h-full bg-base-100 flex flex-col">
                <div className="flex-1 overflow-y-auto">
                  <History />
                </div>
                <Dock />
              </div>
            </ProtectedRoute>
          </Route>
          <Route path="/stats">
            <ProtectedRoute>
              <div className="h-full bg-base-100 flex flex-col">
                <div className="flex-1 overflow-y-auto">
                  <Stats />
                </div>
                <Dock />
              </div>
            </ProtectedRoute>
          </Route>
          <Route path="/workout/:id">
            <ProtectedRoute>
              <div className="h-full bg-base-100 flex flex-col">
                <div className="flex-1 overflow-y-auto">
                  <WorkoutRegistration />
                </div>
                <Dock />
              </div>
            </ProtectedRoute>
          </Route>
          <Route path="/session/:sessionId">
            <ProtectedRoute>
              <div className="h-full bg-base-100 flex flex-col">
                <div className="flex-1 overflow-y-auto">
                  <SessionView />
                </div>
                <Dock />
              </div>
            </ProtectedRoute>
          </Route>
          <Route>
            <ProtectedRoute>
              <div className="h-full bg-base-100 flex flex-col">
                <div className="flex-1 overflow-y-auto">
                  <div className="max-w-md mx-auto px-4 py-6 text-center">
                    <h1 className="text-2xl font-bold mb-2">404</h1>
                    <p className="text-gray-600">Page not found</p>
                  </div>
                </div>
                <Dock />
              </div>
            </ProtectedRoute>
          </Route>
        </Switch>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
