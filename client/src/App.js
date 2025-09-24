// App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Pages/Login';
import SuperiorRoutes from './Pages/Admin/index';
import AdminRoutes from './Pages/System_Admin';
import Superadmin from './Pages/Superadmin'
import PrivateRoute from './routes/PrivateRoute';
import { AuthProvider } from './routes/AuthContext'; 
import OtpVerification from './Pages/OtpVerification';  

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route path="/login" element={<Login />} />
          <Route path="/otp" element={<OtpVerification />} />
          <Route
            path="/Admin/*"
            element={
              <PrivateRoute role="Admin">
                <SuperiorRoutes />
              </PrivateRoute>
            }
          />


          <Route
            path="/System_Admin/*"
            element={
              <PrivateRoute role="System_Admin">
                <AdminRoutes />
              </PrivateRoute>
            }
          />
          <Route
            path="/Superadmin/*"
            element={
              <PrivateRoute role="Super_Admin">
                <Superadmin />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
