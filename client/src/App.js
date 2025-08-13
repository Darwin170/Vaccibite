// App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Pages/Login';
import SuperiorRoutes from './Pages/Superior';
import AdminRoutes from './Pages/System_Admin';
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
          <Route path="/login" element={<Login />} />
          <Route path="/otp" element={<OtpVerification />} />

          {/* Protected routes */}
          <Route
            path="/superior/*"
            element={
              <PrivateRoute role="Superior_Admin">
                <SuperiorRoutes />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/*"
            element={
              <PrivateRoute role="System_Admin">
                <AdminRoutes />
              </PrivateRoute>
            }
          />

          {/* Catch-all → redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
