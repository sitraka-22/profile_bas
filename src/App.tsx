import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar'; // Ajuste le chemin si nécessaire
import Login from './page/Login';
import Dashboard from './page/Dashboard';
import AddAdminForm from './page/AjoutAdmin';

function App() {
  return (
    <Router>
      {/* La Navbar est fixe en haut et visible sur toutes les routes */}
      <Navbar />
      
      {/* Conteneur principal avec une marge en haut pour ne pas être caché sous la Navbar */}
      <div className="pt-20 min-h-screen bg-slate-50">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/Dasshboard" element={<Dashboard />} />
           <Route path="/AddAdminForm" element={<AddAdminForm />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;