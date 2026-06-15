import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './formbuilder/navbar';
import Login from './page/Login';
import Register from './page/Register';
import Dashboard from './page/Dashboard';
import AddAdminForm from './page/AjoutAdmin';
import ListeProjets from './page/ListeProjets';
import AjouterProjet from './page/AjouterProjet';
import EmployeFormBuilder from './employer/employeformbuilder';

// Wrapper pour Login afin d'utiliser useNavigate
function LoginPage({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const navigate = useNavigate();
  return (
    <Login
      onLoginSuccess={onLoginSuccess}
      onNavigateToRegister={() => navigate('/register')}
    />
  );
}

// Wrapper pour Register afin d'utiliser useNavigate
function RegisterPage() {
  const navigate = useNavigate();
  return (
    <Register onNavigateToLogin={() => navigate('/')} />
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />

      <div className="pt-20 min-h-screen bg-slate-50">
        <Routes>
          {/* Page Login */}
          <Route
            path="/"
            element={
              isAuthenticated
                ? <Navigate to="/dashboard" replace />
                : <LoginPage onLoginSuccess={handleLoginSuccess} />
            }
          />

          {/* Page Register */}
          <Route
            path="/register"
            element={
              isAuthenticated
                ? <Navigate to="/dashboard" replace />
                : <RegisterPage />
            }
          />

          {/* Pages protégées */}
          <Route
            path="/dashboard"
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/" replace />}
          />
          <Route
            path="/add-admin"
            element={isAuthenticated ? <AddAdminForm /> : <Navigate to="/" replace />}
          />
          <Route
            path="/ListeProjets"
            element={isAuthenticated ? <ListeProjets /> : <Navigate to="/" replace />}
          />
          <Route
            path="/AjouterProjet"
            element={isAuthenticated ? <AjouterProjet /> : <Navigate to="/" replace />}
          />
          <Route
            path="/employes"
            element={isAuthenticated ? <EmployeFormBuilder /> : <Navigate to="/" replace />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;