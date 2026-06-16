import React, { useState, useEffect } from 'react';
import api from '../service/api';
import AddProjetModal from './AddProjetModal';

interface Projet {
  id_projet: number;
  nom_projet: string;
  description: string;
  type: 'Route' | 'Batiment' | 'Pont';
  date_debut: string | null;
  date_fin_prevue: string | null;
  budget: number | null;
  is_deleted: boolean;
}

const ProjetsManager: React.FC = () => {
  const [projets, setProjets] = useState<Projet[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Sous-menu Principal : 'Actifs' ou 'Corbeille'
  const [viewTab, setViewTab] = useState<'Actifs' | 'Corbeille'>('Actifs');
  
  // Sous-menu de filtre secondaire (Filtre par type de structure)
  const [typeFilter, setTypeFilter] = useState<string>('Tous');

  useEffect(() => {
    fetchProjets();
  }, []);

  const fetchProjets = async () => {
    try {
      setErrorMsg(null);
      const response = await api.get('/api/projets');
      setProjets(response.data);
    } catch (error: any) {
      console.error(error);
      setErrorMsg("Impossible de récupérer la liste des chantiers.");
    }
  };

  // Ajout immédiat au tableau suite au succès du modal
  const handleProjectCreated = (nouveauProjet: Projet) => {
    setProjets((prev) => [nouveauProjet, ...prev]);
  };

  // Déplacement vers la corbeille (Soft Delete)
  const handleSoftDelete = async (id: number) => {
    if (window.confirm("Voulez-vous suspendre ce projet et le déplacer dans la corbeille ?")) {
      try {
        const response = await api.delete(`/api/projets/${id}`);
        if (response.status === 200) {
          // On met à jour l'état local pour changer son flag de suppression
          setProjets((prev) =>
            prev.map((p) => (p.id_projet === id ? { ...p, is_deleted: true } : p))
          );
        }
      } catch (error) {
        setErrorMsg("Erreur lors de la suppression logique.");
      }
    }
  };

  // Restauration depuis la corbeille
  const handleRestore = async (id: number) => {
    try {
      const response = await api.patch(`/api/projets/restaurer/${id}`);
      if (response.status === 200) {
        setProjets((prev) =>
          prev.map((p) => (p.id_projet === id ? { ...p, is_deleted: false } : p))
        );
      }
    } catch (error) {
      setErrorMsg("Erreur lors de la restauration du chantier.");
    }
  };

  // Filtrage combiné : Onglet de suppression + Type d'infrastructure
  const projectsToDisplay = projets.filter((p) => {
    const matchView = viewTab === 'Actifs' ? !p.is_deleted : p.is_deleted;
    const matchType = typeFilter === 'Tous' ? true : p.type === typeFilter;
    return matchView && matchType;
  });

  // Formateur de devises simple
  const formatBudget = (amount: number | null) => {
    if (!amount) return 'Non spécifié';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);
  };

  // Formateur de date propre
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen relative font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* En-tête */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-200 pb-4 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Suivi des Chantiers & Infrastructures</h1>
            <p className="text-sm text-gray-500">Planification des chantiers routiers, ponts et bâtiments COLASS.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2.5 px-4 rounded-xl shadow-lg shadow-blue-200 transition duration-150 active:scale-95"
          >
            ➕ Lancer un chantier
          </button>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl text-sm text-red-700 font-medium shadow-sm">
            {errorMsg}
          </div>
        )}

        {/* DOUBLE SOUS-MENU (NAVIGATION INTÉGRÉE) */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
          
          {/* Menu principal : Actifs vs Corbeille */}
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setViewTab('Actifs')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewTab === 'Actifs' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              🏗️ Chantiers Actifs
            </button>
            <button
              onClick={() => setViewTab('Corbeille')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewTab === 'Corbeille' ? 'bg-red-50 text-red-600 shadow-sm' : 'text-gray-500 hover:text-red-600'
              }`}
            >
              🗑️ Corbeille
            </button>
          </div>

          {/* Filtre secondaire : Type d'infrastructure */}
          <div className="flex items-center space-x-1 bg-gray-50 p-1 rounded-xl border border-gray-200/40">
            {['Tous', 'Route', 'Batiment', 'Pont'].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition ${
                  typeFilter === t
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-500 hover:bg-gray-200/70 hover:text-gray-700'
                }`}
              >
                {t === 'Tous' ? 'Tout voir' : t === 'Batiment' ? 'Bâtiments' : t + 's'}
              </button>
            ))}
          </div>

        </div>

        {/* Affichage sous forme de grille de cartes de chantiers mieux stylisées */}
        {projectsToDisplay.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-16 text-center text-gray-400 italic">
            Aucun projet correspondant aux filtres sélectionnés dans cette section.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projectsToDisplay.map((p) => (
              <div 
                key={p.id_projet} 
                className={`bg-white rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between overflow-hidden ${
                  p.is_deleted ? 'border-red-100 shadow-sm bg-red-50/10' : 'border-gray-100 shadow-sm'
                }`}
              >
                {/* Corps de la Carte */}
                <div className="p-5 space-y-4">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-gray-900 tracking-tight text-base line-clamp-2">{p.nom_projet}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                      p.type === 'Route' ? 'bg-amber-100 text-amber-800' :
                      p.type === 'Batiment' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {p.type === 'Route' ? '🛣️ Route' : p.type === 'Batiment' ? '🏢 Bâtiment' : '🌉 Pont'}
                    </span>
                  </div>

                  <p className="text-gray-500 text-xs line-clamp-3 leading-relaxed h-12 bg-gray-50/50 p-2 rounded-lg border border-gray-100">
                    {p.description || "Aucune description technique rédigée pour ce lot."}
                  </p>

                  {/* Détails dates et budget */}
                  <div className="grid grid-cols-2 gap-y-2 pt-2 border-t border-gray-100 text-xs">
                    <div>
                      <span className="text-gray-400 block font-medium">Début</span>
                      <span className="text-gray-700 font-semibold">{formatDate(p.date_debut)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-medium">Livraison</span>
                      <span className="text-gray-700 font-semibold">{formatDate(p.date_fin_prevue)}</span>
                    </div>
                    <div className="col-span-2 pt-1">
                      <span className="text-gray-400 block font-medium">Budget alloué</span>
                      <span className="text-blue-600 font-bold text-sm">{formatBudget(p.budget)}</span>
                    </div>
                  </div>
                </div>

                {/* Pied de la carte / Actions */}
                <div className={`px-5 py-3 border-t flex justify-end items-center text-xs font-semibold ${
                  p.is_deleted ? 'bg-red-50/30 border-red-100/50' : 'bg-gray-50/50 border-gray-100'
                }`}>
                  {!p.is_deleted ? (
                    <button
                      onClick={() => handleSoftDelete(p.id_projet)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition"
                    >
                      Supprimer (Soft)
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <span className="text-xs text-red-500 font-medium italic self-center mr-2">Dans la corbeille</span>
                      <button
                        onClick={() => handleRestore(p.id_projet)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg transition shadow-sm"
                      >
                        🔄 Restaurer
                      </button>
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}

        {/* Injection contrôlée du Modal indépendant */}
        <AddProjetModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onProjectCreated={handleProjectCreated} 
        />

      </div>
    </div>
  );
};

export default ProjetsManager;