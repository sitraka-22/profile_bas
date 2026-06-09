import React from "react";
import { Link } from "react-router-dom";

const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 w-full bg-slate-800 text-white px-8 py-4 flex justify-between items-center shadow-md z-50">
      <h2 className="text-xl font-bold tracking-wide">MonSite</h2>

      <ul className="flex items-center gap-6 list-none m-0 p-0">
        <li>
          <Link 
            to="/" 
            className="hover:text-blue-400 transition-colors duration-200 text-sm font-medium"
          >
            Connexion
          </Link>
        </li>
        <li>
          <Link 
            to="/Dasshboard" 
            className="hover:text-blue-400 transition-colors duration-200 text-sm font-medium"
          >
            Dashboard
          </Link><Link 
            to="/AddAdminForm" 
            className="hover:text-blue-400 transition-colors duration-200 text-sm font-medium"
          >
            Ajouter Admin
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;