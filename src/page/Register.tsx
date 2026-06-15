import { useState, type FormEvent } from 'react';
import api from '../service/api';

interface RegisterProps {
  onNavigateToLogin: () => void;
}

export default function Register({ onNavigateToLogin }: RegisterProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/register', { email, password });
      setSuccess('Compte créé avec succès ! Redirection vers la connexion...');
      setTimeout(() => onNavigateToLogin(), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création du compte.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 font-sans">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">

        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-[#1a365d] tracking-wider">COLASS</h2>
          <p className="text-sm text-gray-500 mt-1">Créer un nouveau compte</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div className="p-3 text-sm text-center text-red-700 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 text-sm text-center text-green-700 bg-green-50 border border-green-200 rounded-lg">
              {success}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
              Adresse Email
            </label>
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
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
              Mot de passe
            </label>
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

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
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
            {isLoading ? 'Création en cours...' : 'Créer un compte'}
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={onNavigateToLogin}
            className="text-sm text-[#1a365d] hover:underline font-medium cursor-pointer"
          >
            Déjà un compte ? Se connecter
          </button>
        </div>
      </div>
    </div>
  );
}