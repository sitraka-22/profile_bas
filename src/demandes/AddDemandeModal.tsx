import React, { useState, useEffect } from 'react';
import api from '../service/api';

interface Projet {
  id_projet: number;
  nom_projet: string;
}

interface Employe {
  id_employe: number;
  nom: string;
}

interface AddDemandeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDemandeCreated: (nouvelleDemande: any) => void;
}

const AddDemandeModal: React.FC<AddDemandeModalProps> = ({ isOpen, onClose, onDemandeCreated }) => {
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [idProjet, setIdProjet] = useState('');
  const [idEmploye, setIdEmploye] = useState('');

  const [projets, setProjets] = useState<Projet[]>([]);
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Charger les listes de projets et employés pour les balises select
  useEffect(() => {
    if (isOpen) {
      const fetchLists = async () => {
        try {
          const [projetsRes, employesRes] = await Promise.all([
            api.get('/projets'),
            api.get('/employes') // Ajuste l'URL si ton endpoint employé est différent
          ]);
          setProjets(projetsRes.data.filter((p: any) => !p.is_deleted));
          setEmployes(employesRes.data);
        } catch (err) {
          console.error("Erreur chargement des listes de liaison :", err);
        }
      };
      fetchLists();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await api.post('/demandes', {
        titre_demande: titre,
        description,
        id_projet: parseInt(idProjet, 10),
        id_employe: parseInt(idEmploye, 10)
      });

      if (response.status === 201 || response.status === 200) {
        // Optionnel : Comme le backend renvoie le row brut sans les jointures textuelles,
        // on déclenche un rafraîchissement global dans le parent pour avoir les noms propres.
        onDemandeCreated(response.data);
        setTitre('');
        setDescription('');
        setIdProjet('');
        setIdEmploye('');
        onClose();
      }
    } catch (error: any) {
      setErrorMsg(error.response?.data?.error || "Erreur lors de la soumission.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 transition-all">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-md w-full overflow-hidden transform scale-100 transition-all">

        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-gray-800">Soumettre un besoin de terrain</h2>
            <p className="text-xs text-gray-400">Demande d'approvisionnement ou de main d'œuvre COLASS.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded text-xs text-red-700 font-medium">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Titre de la demande *</label>
            <input
              type="text"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder="Ex: Achat de 20 tonnes de gravier"
              className="w-full text-sm px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Chantier concerné (id_projet) *</label>
            <select
              value={idProjet}
              onChange={(e) => setIdProjet(e.target.value)}
              className="w-full text-sm px-3 py-2 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              required
            >
              <option value="">-- Sélectionner le chantier --</option>
              {projets.map((p) => (
                <option key={p.id_projet} value={p.id_projet}>🏗️ {p.nom_projet}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Employé émetteur (id_employe) *</label>
            <select
              value={idEmploye}
              onChange={(e) => setIdEmploye(e.target.value)}
              className="w-full text-sm px-3 py-2 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              required
            >
              <option value="">-- Responsable sur site --</option>
              {employes.map((e) => (
                <option key={e.id_employe} value={e.id_employe}>👤 {e.nom}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Description détaillée des besoins</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Spécifier les dimensions, urgences ou raisons logistiques..."
              rows={3}
              className="w-full text-sm px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition resize-none"
            />
          </div>

          <div className="flex space-x-3 pt-3 border-t border-gray-100 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold py-2 px-4 rounded-xl transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-5 rounded-xl shadow-md transition disabled:opacity-50"
            >
              {loading ? "Transmission..." : "🚀 Envoyer la demande"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDemandeModal;