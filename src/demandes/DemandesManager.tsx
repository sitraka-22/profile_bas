import React, { useState, useEffect } from 'react';
import api from '../service/api';
import AddDemandeModal from './AddDemandeModal';

interface Demande {
  id_demande: number;
  titre_demande: string;
  description: string;
  statut: 'En_attente' | 'Approuve' | 'Refuse';
  id_projet: number;
  nom_projet: string;
  nom_employe: string;
  email_demandeur: string;
  create_at: string;
}

const DemandesManager: React.FC = () => {
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Sous-menu de navigation indépendant pour filtrer par statut
  const [currentTab, setCurrentTab] = useState<string>('Tous');

  useEffect(() => {
    fetchDemandes();
  }, []);

  const fetchDemandes = async () => {
    try {
      setErrorMsg(null);
      const response = await api.get('/api/demandes');
      setDemandes(response.data);
    } catch (error) {
      console.error(error);
      setErrorMsg("Erreur lors de l'accès au registre des demandes de matériel.");
    }
  };

  // Traiter une demande : Approuver ou Refuser (PATCH)
  const handleTraitement = async (id: number, statut: 'Approuve' | 'Refuse') => {
    try {
      setErrorMsg(null);
      const response = await api.patch(`/api/demandes/${id}`, { statut });
      if (response.status === 200) {
        // Mise à jour de l'état local réactive
        setDemandes((prev) =>
          prev.map((d) => (d.id_demande === id ? { ...d, statut } : d))
        );
      }
    } catch (error) {
      setErrorMsg("Action impossible. Droits administratifs manquants.");
    }
  };

  // Annuler définitivement la demande (DELETE)
  const handleDelete = async (id: number) => {
    if (window.confirm("Voulez-vous révoquer et effacer cette demande de matériel ?")) {
      try {
        const response = await api.delete(`/api/demandes/${id}`);
        if (response.status === 200) {
          setDemandes((prev) => prev.filter((d) => d.id_demande !== id));
        }
      } catch (error) {
        setErrorMsg("Erreur lors de la suppression de l'élément.");
      }
    }
  };

  // Filtrage par l'onglet de sous-menu sélectionné
  const filteredDemandes = demandes.filter((d) => {
    if (currentTab === 'Tous') return true;
    return d.statut === currentTab;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4 gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Flux des Demandes Logistiques</h1>
            <p className="text-xs text-gray-500">Validation des flux de ressources et consommables par la direction.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-md transition active:scale-95"
          >
            ➕ Émettre une demande
          </button>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-xl text-xs text-red-700 font-medium shadow-sm">
            {errorMsg}
          </div>
        )}

        {/* SOUS-MENU DE FILTRAGE DES STATUTS */}
        <div className="flex space-x-1.5 bg-white p-1.5 rounded-xl border border-gray-100 shadow-xs max-w-md">
          {['Tous', 'En_attente', 'Approuve', 'Refuse'].map((tab) => (
            <button
              key={tab}
              onClick={() => setCurrentTab(tab)}
              className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition-all ${
                currentTab === tab
                  ? 'bg-blue-50 text-blue-600 shadow-xs'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              {tab === 'Tous' ? '📁 Toutes' : tab === 'En_attente' ? '⏳ En attente' : tab === 'Approuve' ? '✅ Validées' : '❌ Rejetées'}
            </button>
          ))}
        </div>

        {/* Liste des requêtes sous forme de lignes fluides ou table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 text-gray-500 uppercase text-[10px] tracking-wider font-bold border-b border-gray-100">
                  <th className="py-3.5 px-6">Détails de la Demande</th>
                  <th className="py-3.5 px-6">Chantier & Émetteur</th>
                  <th className="py-3.5 px-6">Statut Actuel</th>
                  <th className="py-3.5 px-6 text-right">Actions de Contrôle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-600">
                {filteredDemandes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-gray-400 italic">Aucune fiche de demande enregistrée dans cette catégorie.</td>
                  </tr>
                ) : (
                  filteredDemandes.map((d) => (
                    <tr key={d.id_demande} className="hover:bg-gray-50/40 transition">
                      
                      {/* Titre & Description */}
                      <td className="py-4 px-6 space-y-1 max-w-xs">
                        <div className="font-bold text-gray-900 text-sm">{d.titre_demande}</div>
                        <p className="text-gray-400 line-clamp-2">{d.description || 'Aucun détail fourni.'}</p>
                        <span className="text-[10px] text-gray-400 block font-light">
                          Posté par : <span className="text-gray-500 font-medium">{d.email_demandeur}</span>
                        </span>
                      </td>

                      {/* Alignement Chantier et Employé */}
                      <td className="py-4 px-6 space-y-1">
                        <div className="font-semibold text-gray-800">🏗️ {d.nom_projet}</div>
                        <div className="text-gray-500 text-[11px]">Chef de chantier : <span className="font-medium text-gray-700">{d.nom_employe}</span></div>
                      </td>

                      {/* Badges colorés de Statuts */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          d.statut === 'Approuve' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          d.statut === 'Refuse' ? 'bg-red-50 text-red-700 border border-red-200' : 
                          'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                        }`}>
                          {d.statut === 'Approuve' ? '● Validée' : d.statut === 'Refuse' ? '● Refusée' : '● En traitement'}
                        </span>
                      </td>

                      {/* Boutons décisionnels administratifs */}
                      <td className="py-4 px-6 text-right space-x-1.5 whitespace-nowrap">
                        {d.statut === 'En_attente' && (
                          <>
                            <button
                              onClick={() => handleTraitement(d.id_demande, 'Approuve')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-2.5 py-1 rounded-lg transition"
                            >
                              Approuver
                            </button>
                            <button
                              onClick={() => handleTraitement(d.id_demande, 'Refuse')}
                              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-2.5 py-1 rounded-lg transition"
                            >
                              Refuser
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(d.id_demande)}
                          className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg transition ml-2"
                          title="Supprimer la fiche"
                        >
                          🗑️
                        </button>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Appel du Modal d'Ajout */}
        <AddDemandeModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onDemandeCreated={fetchDemandes} // On recharge tout pour récupérer les jointures SQL propres
        />

      </div>
    </div>
  );
};

export default DemandesManager;