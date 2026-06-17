import { useState, type FormEvent } from 'react';
import api from '../service/api';
import imagePremier from "../assets/Icons/Apps-BitTorrent-Metro.ico";

interface LoginProps {
  onLoginSuccess: () => void;
  onNavigateToRegister: () => void;
}

interface ToastNotification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function Login({ onLoginSuccess, onNavigateToRegister }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fonction pour déclencher un popup fluide en haut à droite
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000); // Disparaît après 4 secondes
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      showToast("Vérification de vos accès professionnels...", "info");
      
      // Remarque : Ton backend attend "password" d'après ton ancien code
      const response = await api.post('/auth/login', { email, password });
      
      localStorage.setItem('token', response.data.token);
      showToast("Authentification réussie ! Chargement de l'espace de travail... 🎉", "success");
      
      setTimeout(() => {
        onLoginSuccess();
      }, 1200);
      
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Identifiants incorrects ou serveur COLASS injoignable.';
      showToast(errorMsg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 font-sans relative">
      
      {/* 🔔 ZONE D'AFFICHAGE DES POPUPS (TOASTS) EN HAUT A DROITE */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center p-4 rounded-xl shadow-xl border backdrop-blur-md transition-all duration-300 transform translate-x-0 animate-fade-in-right ${
              t.type === 'success' ? 'bg-emerald-50/95 border-emerald-200 text-emerald-900' :
              t.type === 'error' ? 'bg-red-50/95 border-red-200 text-red-900' :
              'bg-blue-50/95 border-blue-200 text-blue-900'
            }`}
          >
            <div className="text-lg mr-3">
              {t.type === 'success' && '✅'}
              {t.type === 'error' && '❌'}
              {t.type === 'info' && '⏳'}
            </div>
            <div className="text-xs font-semibold flex-1 leading-snug">{t.message}</div>
            <button
              onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
              className="ml-4 text-gray-400 hover:text-gray-700 font-bold text-sm"
            >
              &times;
            </button>
          </div>
        ))}
      </div>

      {/* 📦 CARD DE CONNEXION DOUBLE-PANNEAU EQUILIBRE */}
      <div className="flex w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden min-h-[550px] flex-col md:flex-row">
        
        {/* ====================================================================
            PANNEAU GAUCHE : L'image affichée de même taille que le formulaire
           ==================================================================== */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#1a365d] to-[#2b6cb0] p-10 flex-col items-center justify-center text-center text-white relative">
          
          {/* Cercles de lumière subtils en arrière-plan */}
          <div className="absolute w-64 h-64 bg-white/5 rounded-full -top-12 -left-12 blur-2xl pointer-events-none" />
          <div className="absolute w-48 h-48 bg-blue-400/10 rounded-full bottom-10 right-10 blur-xl pointer-events-none" />
          
          {/* Affichage de ton icône locale dans un cadre élégant */}
          <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-md shadow-inner border border-white/10 mb-6 transition-all duration-300 hover:scale-105">
            <img 
              src={imagePremier} 
              alt="Logo COLASS" 
              className="w-24 h-24 object-contain filter drop-shadow-md"
            />
          </div>

          <h3 className="text-xl font-black tracking-wide uppercase">COLASS S.A.</h3>
          <p className="text-xs text-blue-100 max-w-xs mt-3 leading-relaxed">
            Plateforme de gestion, de suivi d'avancement des chantiers et de régulation logistique du personnel.
          </p>
        </div>

        {/* ====================================================================
            PANNEAU DROIT : Formulaire principal de connexion
           ==================================================================== */}
        <div className="flex-1 p-8 sm:p-12 flex flex-col justify-center bg-white w-full">
          
          {/* En-tête du formulaire (Visible sur mobile à la place du panneau gauche) */}
          <div className="text-center md:text-left mb-8">
            <div className="md:hidden flex justify-center mb-4">
              <img src={imagePremier} alt="Logo" className="w-16 h-16 object-contain" />
            </div>
            <h2 className="text-2xl font-black text-[#1a365d] tracking-tight">Portail Authentification</h2>
            <p className="text-xs text-gray-400 mt-1">Saisissez vos identifiants pour rejoindre votre session.</p>
          </div>

          {/* Formulaire réactif */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                Adresse Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="employe@colass.com"
                required
                disabled={isLoading}
                className="px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-[#2b6cb0] focus:ring-2 focus:ring-blue-100 text-gray-800 disabled:bg-gray-50 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
                className="px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-[#2b6cb0] focus:ring-2 focus:ring-blue-100 text-gray-800 disabled:bg-gray-50 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-[#1a365d] hover:bg-[#2b6cb0] text-white font-bold text-xs py-3.5 px-4 rounded-xl shadow-md shadow-blue-900/10 transition-all duration-150 active:scale-[0.98] disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer uppercase tracking-wider"
            >
              {isLoading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </form>

          {/* Zone de bascule création de compte */}
          <div className="text-center mt-8 pt-4 border-t border-gray-100">
            <button
              onClick={onNavigateToRegister}
              className="text-xs text-[#1a365d] hover:text-[#2b6cb0] hover:underline font-semibold cursor-pointer transition-colors"
            >
              Pas encore inscrit ? Créer un compte d'accès
            </button>
          </div>
          
        </div>

      </div>
    </div>
  );
}