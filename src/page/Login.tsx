import { useState, type ChangeEvent } from 'react';
import api from '../service/api';
import Navbar from "../formbuilder/navbar"
interface LoginProps {
  onLoginSuccess: () => void;
  onNavigateToRegister: () => void;
}

export default function Login({ onLoginSuccess, onNavigateToRegister }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: ChangeEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      onLoginSuccess(); // Fait basculer l'application vers le Dashboard
    } catch (err: any) {
      setError(err.response?.data?.message || 'Identifiants incorrects ou serveur injoignable.');
    } finally {
      setIsLoading(false);
    }
  };

  

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 font-sans">
    

      
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <Navbar/>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-[#1a365d] tracking-wider">COLASS</h2>
          <p className="text-sm text-gray-500 mt-1">Gestion interne des chantiers</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div className="p-3 text-sm text-center text-red-700 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Adresse Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="employe@colass.com"
              required
              disabled={isLoading}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#2b6cb0] text-gray-800 disabled:bg-gray-50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#2b6cb0] text-gray-800 disabled:bg-gray-50"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 bg-[#1a365d] hover:bg-[#2b6cb0] text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors duration-200 disabled:bg-gray-400 cursor-pointer"
          >
            {isLoading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>
        <div className="text-center mt-6">
          <button 
            onClick={onNavigateToRegister}
            className="text-sm text-[#1a365d] hover:underline font-medium cursor-pointer"
          >
            Pas encore de compte ? Créer un compte
          </button>
        </div>
      </div>
    </div>
  );
}