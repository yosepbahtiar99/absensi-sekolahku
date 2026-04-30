import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';

// Features
import LoginPage from '../../features/auth/pages/LoginPage';
import GuruLayout from '../../features/teacher-attendance/components/GuruLayout';
import GuruDashboard from '../../features/teacher-attendance/pages/GuruDashboard';
import GuruSchedule from '../../features/teacher-attendance/pages/GuruSchedule';
import GuruApproval from '../../features/teacher-attendance/pages/GuruApproval';
import GuruProfile from '../../features/teacher-attendance/pages/GuruProfile';
import AttendancePage from '../../features/teacher-attendance/pages/AttendancePage';
import AdminDashboard from '../../features/admin/pages/AdminDashboard';
import AdminActivities from '../../features/admin/pages/AdminActivities';
import MasterGuru from '../../features/master-data/guru/pages/MasterGuru';
import MasterKelas from '../../features/master-data/kelas/pages/MasterKelas';
import MasterPelajaran from '../../features/master-data/lesson/pages/MasterPelajaran';
import MasterSchedule from '../../features/master-data/schedule/pages/MasterSchedule';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      {/* Guru Routes */}
      <Route 
        element={
          <ProtectedRoute role="guru">
            <GuruLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/home" element={<GuruDashboard />} />
        <Route path="/schedule" element={<GuruSchedule />} />
        <Route path="/approval" element={<GuruApproval />} />
        <Route path="/profile" element={<GuruProfile />} />
      </Route>

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
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/activities" 
        element={
          <ProtectedRoute role="admin">
            <AdminActivities />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/guru" 
        element={
          <ProtectedRoute role="admin">
            <MasterGuru />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/kelas" 
        element={
          <ProtectedRoute role="admin">
            <MasterKelas />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/schedule" 
        element={
          <ProtectedRoute role="admin">
            <MasterSchedule />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/pelajaran" 
        element={
          <ProtectedRoute role="admin">
            <MasterPelajaran />
          </ProtectedRoute>
        } 
      />

      {/* Default Route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
