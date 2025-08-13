// App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Pages/Login';
import SuperiorRoutes from './Pages/Superior/index';
import AdminRoutes from './Pages/System_Admin';
import PrivateRoute from './routes/PrivateRoute';
import { AuthProvider } from './routes/AuthContext'; // ✅ import AuthProvider
import OtpVerification from "./Pages/OtpVerification";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* 🔁 Redirect root to login */}
          <Route path="/" element={<Navigate to="/Login" replace />} />


          <Route path="/otp" element={<OtpVerification />} />

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
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
