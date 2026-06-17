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
import ProjetsChart from "./projets/ProjetsChart";
import DemandesManager from "./demandes/DemandesManager";
import Verification from "./poubel/Verification";
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
                <ProjetsChart
                  projets={[
                    {
                      nom: 'Projet A',
                      type: 'Route',
                      date_debut: '2023-01-01',
                      date_fin_prevue: '2023-12-31',
                      budget: 1000000,
                      is_deleted: false,
                    },
                    {
                      nom: 'Projet B',
                      type: 'Batiment',
                      date_debut: '2023-02-01',
                      date_fin_prevue: '2023-11-30',
                      budget: 2000000,
                      is_deleted: false,
                    },
                    {
                      nom: 'Projet C',
                      type: 'Pont',
                      date_debut: '2023-03-01',
                      date_fin_prevue: '2023-10-31',
                      budget: 1500000,
                      is_deleted: true, // Projet supprimé, ne sera pas pris en compte dans le graphique
                    },
                  ]}
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
          />
          <Route
            path="/verification"
            element={
              isAuthenticated ? (
                <Verification />
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