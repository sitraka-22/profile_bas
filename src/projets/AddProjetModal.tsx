import React, { useState } from 'react';
import api from '../service/api';

interface AddProjetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (nouveauProjet: any) => void;
}

const AddProjetModal: React.FC<AddProjetModalProps> = ({ isOpen, onClose, onProjectCreated }) => {
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'Route' | 'Batiment' | 'Pont'>('Route');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [budget, setBudget] = useState<number | string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await api.post('/projets', {
        nom_projet: nom,
        description,
        type,
        date_debut: dateDebut || null,
        date_fin_prevue: dateFin || null,
        budget: budget ? parseFloat(budget.toString()) : null
      });

      if (response.status === 201 || response.status === 200) {
        // Le backend renvoie { message, projet: rows[0] }
        onProjectCreated(response.data.projet);
        
        // Reset du formulaire
        setNom('');
        setDescription('');
        setType('Route');
        setDateDebut('');
        setDateFin('');
        setBudget('');
        onClose();
      }
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.response?.data?.message || "Erreur lors de la création du projet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-lg w-full overflow-hidden transform transition-all scale-100">
        
        {/* En-tête du Modal */}
        <div className="px-6 py-4 bg-gray-50/80 border-b border-gray-200/60 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Nouveau Chantier COLASS</h2>
            <p className="text-xs text-gray-500">Ajouter une infrastructure au réseau actif.</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-lg transition text-xl font-bold"
          >
            &times;
          </button>
        </div>
        
        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded text-xs text-red-700 font-medium">
              ⚠️ {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Nom du projet *</label>
            <input 
              type="text" 
              value={nom} 
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex: Réhabilitation Axe Principal RN7" 
              className="w-full text-sm px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition"
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Type d'Infrastructure *</label>
              <select 
                value={type} 
                onChange={(e) => setType(e.target.value as any)}
                className="w-full text-sm px-3 py-2 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              >
                <option value="Route">🛣️ Route</option>
                <option value="Batiment">🏢 Bâtiment</option>
                <option value="Pont">🌉 Pont</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Budget prévisionnel (€/Ar)</label>
              <input 
                type="number" 
                value={budget} 
                onChange={(e) => setBudget(e.target.value)}
                placeholder="Ex: 450000" 
                className="w-full text-sm px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Date de début</label>
              <input 
                type="date" 
                value={dateDebut} 
                onChange={(e) => setDateDebut(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Fin prévue</label>
              <input 
                type="date" 
                value={dateFin} 
                onChange={(e) => setDateFin(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Cahier des charges / Description</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Spécifications techniques du chantier, localisation complète..." 
              rows={3}
              className="w-full text-sm px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition resize-none"
            />
          </div>

          {/* Boutons d'action */}
          <div className="flex space-x-3 pt-4 border-t border-gray-100 justify-end">
            <button 
              type="button"
              onClick={onClose}
              disabled={loading}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm py-2 px-4 rounded-xl transition active:scale-95 disabled:opacity-50"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2 px-5 rounded-xl shadow-md shadow-blue-200 transition active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? 'Création...' : '🚀 Lancer le projet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProjetModal;