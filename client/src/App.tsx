import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import GuruHome from './pages/GuruHome';
import AttendancePage from './pages/AttendancePage';
import { useAuthStore } from './store/authStore';

// Protected Route Component
const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role?: string }) => {
  const { user, token } = useAuthStore();
  
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/home'} replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        {/* Guru Routes */}
        <Route 
          path="/home" 
          element={
            <ProtectedRoute role="guru">
              <GuruHome />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/attendance/:scheduleId" 
          element={
            <ProtectedRoute role="guru">
              <AttendancePage />
            </ProtectedRoute>
          } 
        />

        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute role="admin">
              <div className="p-8 text-center"><h1>Dashboard Admin (Coming Soon)</h1></div>
            </ProtectedRoute>
          } 
        />

        {/* Default Route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
