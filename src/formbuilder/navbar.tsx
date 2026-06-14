import React from "react";
import { Link, useNavigate } from "react-router-dom";

interface NavbarProps {
  isAuthenticated: boolean;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isAuthenticated, onLogout }) => {
  const navigate = useNavigate();

  const handleDisconnect = () => {
    onLogout();
    navigate("/"); // Redirection automatique vers le login après déconnexion
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-[#1a365d] text-white shadow-md z-50 px-6 flex items-center justify-between font-sans">
      {/* Logo / Titre du Projet */}
      <div className="flex items-center gap-2">
        <Link
          to={isAuthenticated ? "/dashboard" : "/"}
          className="text-xl font-black tracking-widest hover:text-blue-200 transition-colors"
        >
          COLASS
        </Link>
        <span className="hidden sm:inline-block text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">
          Interne
        </span>
      </div>

      {/* Liens de navigation conditionnels */}
      <div className="flex items-center gap-6">
        {isAuthenticated ? (
          <>
            <Link
              to="/dashboard"
              className="text-sm font-semibold hover:text-blue-200 transition-colors bg-[#2b6cb0] px-3 py-1.5 rounded-lg shadow-sm"
            >
              Tableau de bord
            </Link>
            <Link
              to="/add-admin"
              className="text-sm font-semibold hover:text-blue-200 transition-colors bg-[#2b6cb0] px-3 py-1.5 rounded-lg shadow-sm"
            >
              + Nouvel Admin
            </Link>{" "}
            <Link
              to="/ListeProjets"
              className="text-sm font-semibold hover:text-blue-200 transition-colors bg-[#2b6cb0] px-3 py-1.5 rounded-lg shadow-sm"
            >
              Projet
            </Link>
            <Link
              to="/AjouterProjet"
              className="text-sm font-semibold hover:text-blue-200 transition-colors bg-[#2b6cb0] px-3 py-1.5 rounded-lg shadow-sm"
            >
              AjouterProjet
            </Link>
            <Link
              to="/employes"
              className="text-sm font-semibold hover:text-blue-200 transition-colors bg-[#2b6cb0] px-3 py-1.5 rounded-lg shadow-sm"
            >
              Effectifs Personnel
            </Link>
            <Link
              to="/ressources"
              className="text-sm font-semibold hover:text-blue-200 transition-colors bg-[#2b6cb0] px-3 py-1.5 rounded-lg shadow-sm"
            >
              Ressources
            </Link> <Link
              to="/demandes"
              className="text-sm font-semibold hover:text-blue-200 transition-colors bg-[#2b6cb0] px-3 py-1.5 rounded-lg shadow-sm"
            >
              Demandes
            </Link>
            {/* Bouton de déconnexion */}
            <button
              onClick={handleDisconnect}
              className="text-sm font-bold bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              Déconnexion
            </button>
          </>
        ) : (
          <span className="text-sm text-gray-300 italic">
            Veuillez vous authentifier
          </span>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
