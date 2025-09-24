import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Pages/Login';
import Superadmin from './Pages/Superadmin'
import AdminRoutes from './Pages/Admin';
import SystemAdminRoutes from './Pages/System_Admin';
import PrivateRoute from './routes/PrivateRoute';
import { AuthProvider } from './routes/AuthContext';
import OtpVerification from './Pages/OtpVerification';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Default route */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Auth pages */}
          <Route path="/login" element={<Login/>} />
          <Route path="/otp" element={<OtpVerification/>} />

          {/* Protected routes */}
          <Route
            path="/Admin/*"
            element={
              <PrivateRoute role="Admin">
                <AdminRoutes/>
              </PrivateRoute>
            }
          />

          <Route
            path="/System_Admin/*"
            element={
              <PrivateRoute role="System_Admin">
                <SystemAdminRoutes/>
              </PrivateRoute>
            }
          />

          <Route
            path="/Superadmin/*"
            element={
              <PrivateRoute role="Super_Admin">
                <Superadmin/>
              </PrivateRoute>
            }
          />

          {/* Catch-all redirects to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
