import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,

  useNavigate,

} from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./formbuilder/navbar"; // Ajusté selon l'image (src/formbuilder/navbar.tsx)
import Login from "./page/Login";
import Dashboard from "./page/Dashboard";
import AddAdminForm from "./page/AjoutAdmin";
import Register from "./page/Register";

import EmployeFormBuilder from "./employer/employeformbuilder";


import RessourcesManager from "./ressource/ressource"; // Nouveau composant pour gérer les ressources
import ProjetsManager from "./projets/ProjetsManager";
import AddProjetModal from "./projets/AddProjetModal";
import DemandesManager from "./demandes/DemandesManager";
import GestionPoubelles from "./poubel/poubel";
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
            path="/demandes"

            element={isAuthenticated ? <DemandesManager /> : <Navigate to="/" replace />}
          />
          <Route
            path="/ListeProjets"
           

            element={
              isAuthenticated ? <ProjetsManager /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/AjouterProjet"
            element={
              isAuthenticated ? (
                <AddProjetModal
                  isOpen={true}
                  onClose={() => (window.location.href = "/ListeProjets")}
                  onProjectCreated={() => (window.location.href = "/ListeProjets")}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }

          />
          <Route
            path="/employes"
            element={isAuthenticated ? <EmployeFormBuilder /> : <Navigate to="/" replace />}
          />


          <Route
          path="/ressources"
          element={
            isAuthenticated ? (
              <RessourcesManager />
            ) : (
              <Navigate to="/" replace />
            )
          }
        /> <Route
          path="/demandes"
          element={
            isAuthenticated ? (
              <DemandesManager />
            ) : (
              <Navigate to="/" replace />
            )
          }
        /> <Route
          path="/Poubeles"
          element={
            isAuthenticated ? (
              <GestionPoubelles />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
          {/* Route Register de secours */}
          <Route path="/register" element={<Register />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;