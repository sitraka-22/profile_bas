import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./formbuilder/navbar"; // Ajusté selon l'image (src/formbuilder/navbar.tsx)
import Login from "./page/Login";
import Dashboard from "./page/Dashboard";
import AddAdminForm from "./page/AjoutAdmin";
import Register from "./page/Register";
import ListeProjets from "./page/ListeProjets";
import AjouterProjet from "./page/AjouterProjet";
import EmployeFormBuilder from "./employer/employeformbuilder";

function App() {
  // État global pour savoir si l'administrateur est connecté
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Vérification initiale de la présence d'un token au chargement de l'application
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  // Fonction appelée par le composant Login après la réception réussie du JWT
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  // Fonction de déconnexion
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  return (
    <Router>
      {/* Navbar dynamique : elle reçoit l'état de connexion et la fonction de déconnexion */}
      <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />

      <div className="pt-20 min-h-screen bg-slate-50">
        <Routes>
          {/* Si déjà connecté, redirige "/" directement vers le Dashboard */}
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Login
                  onLoginSuccess={handleLoginSuccess}
                  onNavigateToRegister={() =>
                    (window.location.href = "/register")
                  }
                />
              )
            }
          />

          {/* Route Dashboard (Orthographe corrigée en /dashboard) */}
          <Route
            path="/dashboard"
            element={
              isAuthenticated ? <Dashboard /> : <Navigate to="/" replace />
            }
          />

          {/* Route d'ajout d'administrateur */}
          <Route
            path="/add-admin"
            element={
              isAuthenticated ? <AddAdminForm /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/ListeProjets"
            element={
              isAuthenticated ? <ListeProjets /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/AjouterProjet"
            element={
              isAuthenticated ? <AjouterProjet /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/employes"
            element={
              isAuthenticated ? (
                <EmployeFormBuilder />
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
