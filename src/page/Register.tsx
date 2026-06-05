import { useState, useEffect } from 'react';
import MainLayout from '../formbuilder/MainLayout'; // Import décommenté et corrigé vers le bon dossier
import Login from '../page/Login';         // Dossier harmonisé avec un "s"
import Dashboard from '../page/Dashboard'; // Dossier harmonisé avec un "s"
import AjouterProjet from '../page/AjouterProjet';
import ListeProjets from '../page/ListeProjets';
import Poubelle from '../page/Poubelle';


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authScreen, setAuthScreen] = useState<'login' | 'register'>('login'); // Gère la bascule hors-connexion
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [subModule, setSubModule] = useState('liste');

  // Vérification de la présence d'un token au démarrage de l'app
  useEffect(() => {
    const token = localStorage.getItem('colass_token'); // Clé synchronisée avec ton fichier api.ts
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('colass_token');
    setIsAuthenticated(false);
    setCurrentPage('dashboard');
  };

  // --- LOGIQUE HORS-CONNEXION ---
  if (!isAuthenticated) {
    if (authScreen === 'register') {
      // On affiche la page Register et on lui passe la fonction pour revenir au Login
      return <Register onNavigateToLogin={() => setAuthScreen('login')} />;
    }
    
    // On affiche la page Login et on lui donne la possibilité de basculer vers Register
    return (
      <Login 
        onLoginSuccess={() => setIsAuthenticated(true)} 
        onNavigateToRegister={() => setAuthScreen('register')} 
      />
    );
  }

  // --- LOGIQUE STRUCTURELLE APRÈS CONNEXION ---
  const projetsSubMenu = (
    <div>
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Sous-Menu</h3>
      <ul className="flex flex-col gap-1.5">
        <li 
          className={`px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
            subModule === 'liste' ? 'bg-gray-200 text-[#1a365d]' : 'text-gray-600 hover:bg-gray-100'
          }`} 
          onClick={() => setSubModule('liste')}
        >
          Liste des chantiers
        </li>
        <li 
          className={`px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
            subModule === 'ajouter' ? 'bg-gray-200 text-[#1a365d]' : 'text-gray-600 hover:bg-gray-100'
          }`} 
          onClick={() => setSubModule('ajouter')}
        >
          Nouveau projet
        </li>
      </ul>
    </div>
  );

  return (
    <MainLayout 
      activePage={currentPage} 
      onNavigate={(page) => {
        if (page === 'login') {
          handleLogout();
        } else {
          setCurrentPage(page);
        }
      }}
      subMenu={currentPage === 'projets' ? projetsSubMenu : undefined}
    >
      {/* Rendu conditionnel des pages principales */}
      {currentPage === 'dashboard' && <Dashboard />}
      
      {currentPage === 'projets' && (
        <>
          {subModule === 'liste' ? <ListeProjets /> : <AjouterProjet />}
        </>
      )}

      {currentPage === 'poubelle' && <Poubelle />}
    </MainLayout>
  );
}

export default App;