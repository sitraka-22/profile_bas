import React, { useState, useEffect } from 'react';
import api from '../service/api';
import AddDemandeModal from './AddDemandeModal';

interface Demande {
  id_demande: number;
  titre_demande: string;
  description: string;
  staut: 'En_attente' | 'Approuve' | 'Refuse'; // ← attention : "staut" dans la BDD
  id_projet: number;
  nom_projet: string;
  nom_employe: string;
  email_demandeur: string;
  create_at: string;
  delete_at?: string;
}

const DemandesManager: React.FC = () => {
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [corbeille, setCorbeille] = useState<Demande[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<string>('Tous');
  const [showCorbeille, setShowCorbeille] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDemandes = async () => {
    try {
      setErrorMsg(null);
      const response = await api.get('/demandes'); // ← corrigé
      setDemandes(response.data);
    } catch (error) {
      console.error(error);
      setErrorMsg("Erreur lors de l'accès au registre des demandes de matériel.");
    }
  };

  const fetchCorbeille = async () => {
    try {
      setErrorMsg(null);
      const response = await api.get('/demandes/corbeille'); // ← corrigé
      setCorbeille(response.data);
    } catch (error) {
      console.error(error);
      setErrorMsg("Erreur lors de l'accès à la corbeille.");
    }
  };

  useEffect(() => {
    if (showCorbeille) {
      fetchCorbeille();
    } else {
      fetchDemandes();
    }
  }, [showCorbeille, currentTab]);

  const handleTraitement = async (id: number, statut: 'Approuve' | 'Refuse') => {
    try {
      setErrorMsg(null);
      const response = await api.patch(`/demandes/${id}`, { statut }); // ← corrigé
      if (response.status === 200) {
        setDemandes((prev) =>
          prev.map((d) => (d.id_demande === id ? { ...d, staut: statut } : d))
        );
      }
    } catch (error) {
      setErrorMsg("Action impossible. Droits administratifs manquants.");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Voulez-vous déplacer cette demande vers la corbeille ?")) {
      try {
        const response = await api.delete(`/demandes/${id}`); // ← corrigé
        if (response.status === 200) {
          setDemandes((prev) => prev.filter((d) => d.id_demande !== id));
        }
      } catch (error) {
        setErrorMsg("Erreur lors de la suppression de l'élément.");
      }
    }
  };

  const handleRestaurer = async (id: number) => {
    try {
      const response = await api.patch(`/demandes/${id}/restaurer`); // ← corrigé
      if (response.status === 200) {
        setCorbeille((prev) => prev.filter((d) => d.id_demande !== id));
      }
    } catch (error) {
      setErrorMsg("Erreur lors de la restauration.");
    }
  };

  const handleDeleteDefinitif = async (id: number) => {
    if (window.confirm("Cette action est irréversible. Supprimer définitivement cette demande ?")) {
      try {
        const response = await api.delete(`/demandes/${id}/definitif`); // ← corrigé
        if (response.status === 200) {
          setCorbeille((prev) => prev.filter((d) => d.id_demande !== id));
        }
      } catch (error) {
        setErrorMsg("Erreur lors de la suppression définitive.");
      }
    }
  };

  // Filtre local par statut + recherche
  const demandesFiltrees = demandes.filter((d) => {
    const matchTab = currentTab === 'Tous' ? true : d.staut === currentTab;
    const search = searchTerm.toLowerCase().trim();
    const matchSearch = search === '' ? true :
      d.titre_demande?.toLowerCase().includes(search) ||
      d.description?.toLowerCase().includes(search) ||
      d.nom_projet?.toLowerCase().includes(search) ||
      d.nom_employe?.toLowerCase().includes(search) ||
      d.email_demandeur?.toLowerCase().includes(search);
    return matchTab && matchSearch;
  });

  const listeAffichee = showCorbeille ? corbeille : demandesFiltrees;

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4 gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Flux des Demandes Logistiques</h1>
            <p className="text-xs text-gray-500">Validation des flux de ressources et consommables par la direction.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCorbeille((v) => !v)}
              className={`inline-flex items-center justify-center font-semibold text-xs py-2.5 px-4 rounded-xl shadow-md transition active:scale-95 ${showCorbeille
                ? 'bg-gray-800 text-white hover:bg-gray-900'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
            >
              🗑️ Poubelle
            </button>
            {!showCorbeille && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-md transition active:scale-95"
              >
                ➕ Émettre une demande
              </button>
            )}
          </div>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-xl text-xs text-red-700 font-medium shadow-sm">
            {errorMsg}
          </div>
        )}

        {!showCorbeille && (
          <>
            <div className="relative max-w-md">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="🔍 Rechercher (titre, projet, employé, email...)"
                className="w-full text-xs py-2.5 px-4 rounded-xl border border-gray-200 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>

            <div className="flex space-x-1.5 bg-white p-1.5 rounded-xl border border-gray-100 shadow-xs max-w-md">
              {['Tous', 'En_attente', 'Approuve', 'Refuse'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setCurrentTab(tab)}
                  className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition-all ${currentTab === tab
                    ? 'bg-blue-50 text-blue-600 shadow-xs'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                >
                  {tab === 'Tous' ? '📁 Toutes' : tab === 'En_attente' ? '⏳ En attente' : tab === 'Approuve' ? '✅ Validées' : '❌ Rejetées'}
                </button>
              ))}
            </div>
          </>
        )}

        {showCorbeille && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
            Vous consultez la corbeille. Les éléments listés ici ont été supprimés et peuvent être restaurés ou effacés définitivement.
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 text-gray-500 uppercase text-[10px] tracking-wider font-bold border-b border-gray-100">
                  <th className="py-3.5 px-6">Détails de la Demande</th>
                  <th className="py-3.5 px-6">Chantier & Émetteur</th>
                  <th className="py-3.5 px-6">{showCorbeille ? 'Supprimée le' : 'Statut Actuel'}</th>
                  <th className="py-3.5 px-6 text-right">Actions de Contrôle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-600">
                {listeAffichee.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-gray-400 italic">
                      {showCorbeille ? 'La corbeille est vide.' : 'Aucune fiche de demande enregistrée dans cette catégorie.'}
                    </td>
                  </tr>
                ) : (
                  listeAffichee.map((d) => (
                    <tr key={d.id_demande} className="hover:bg-gray-50/40 transition">
                      <td className="py-4 px-6 space-y-1 max-w-xs">
                        <div className="font-bold text-gray-900 text-sm">{d.titre_demande}</div>
                        <p className="text-gray-400 line-clamp-2">{d.description || 'Aucun détail fourni.'}</p>
                        <span className="text-[10px] text-gray-400 block font-light">
                          Posté par : <span className="text-gray-500 font-medium">{d.email_demandeur}</span>
                        </span>
                      </td>

                      <td className="py-4 px-6 space-y-1">
                        <div className="font-semibold text-gray-800">🏗️ {d.nom_projet}</div>
                        <div className="text-gray-500 text-[11px]">
                          Chef de chantier : <span className="font-medium text-gray-700">{d.nom_employe}</span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        {showCorbeille ? (
                          <span className="text-gray-500 text-[11px]">
                            {d.delete_at ? new Date(d.delete_at).toLocaleString('fr-FR') : '—'}
                          </span>
                        ) : (
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${d.staut === 'Approuve' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            d.staut === 'Refuse' ? 'bg-red-50 text-red-700 border border-red-200' :
                              'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                            }`}>
                            {d.staut === 'Approuve' ? '● Validée' : d.staut === 'Refuse' ? '● Refusée' : '● En traitement'}
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-right space-x-1.5 whitespace-nowrap">
                        {showCorbeille ? (
                          <>
                            <button
                              onClick={() => handleRestaurer(d.id_demande)}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-2.5 py-1 rounded-lg transition"
                            >
                              ♻️ Restaurer
                            </button>
                            <button
                              onClick={() => handleDeleteDefinitif(d.id_demande)}
                              className="bg-red-600 hover:bg-red-700 text-white font-medium px-2.5 py-1 rounded-lg transition ml-2"
                            >
                              Effacer définitivement
                            </button>
                          </>
                        ) : (
                          <>
                            {d.staut === 'En_attente' && (
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
                              title="Déplacer vers la corbeille"
                            >
                              🗑️
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <AddDemandeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onDemandeCreated={fetchDemandes}
        />
      </div>
    </div>
  );
};

export default DemandesManager;