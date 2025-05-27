// App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Pages/Login';
import SuperiorRoutes from './Pages/Superior/index';
import OperationalRoutes from './Pages/Operational/index';
import AdminRoutes from './Pages/System_Admin';
import PrivateRoute from './routes/PrivateRoute';
import { AuthProvider } from './routes/AuthContext'; // ✅ import AuthProvider

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* 🔁 Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route path="/login" element={<Login />} />
          
          <Route
            path="/superior/*"
            element={
              <PrivateRoute role="Superior_Admin">
                <SuperiorRoutes />
              </PrivateRoute>
            }
          />

          <Route
            path="/operational/*"
            element={
              <PrivateRoute role="Operational_Staff">
                <OperationalRoutes />
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
