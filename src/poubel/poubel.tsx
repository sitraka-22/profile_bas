import React, { useState } from 'react';


// Définition du type pour une Poubelle
export interface Poubelle {
  id?: number;
  nom: string;
  type: 'Plastique' | 'Organique' | 'Papier' | 'Verre';
  localisation: string;
  remplissage: number; // En pourcentage (0 à 100)
  statut: 'Actif' | 'Maintenance' | 'Plein';
}

const GestionPoubelles: React.FC = () => {
  // Liste fictive pour l'exemple
  const [poubelles, setPoubelles] = useState<Poubelle[]>([
    { id: 1, nom: "Poubelle A1", type: "Plastique", localisation: "Bloc Administratif", remplissage: 45, statut: "Actif" },
    { id: 2, nom: "Poubelle B3", type: "Verre", localisation: "Cafétéria", remplissage: 90, statut: "Plein" },
    { id: 3, nom: "Poubelle C2", type: "Organique", localisation: "Laboratoire", remplissage: 10, statut: "Maintenance" },
  ]);

  // États pour la gestion de la Popup
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedPoubelle, setSelectedPoubelle] = useState<Poubelle | null>(null);

  // Ouvrir la popup pour l'ajout
  const handleAddClick = () => {
    setSelectedPoubelle(null);
    setIsModalOpen(true);
  };

  // Ouvrir la popup pour la modification
  const handleEditClick = (poubelle: Poubelle) => {
    setSelectedPoubelle(poubelle);
    setIsModalOpen(true);
  };

  // Sauvegarder les données (Ajout ou Modification)
  const handleSave = (poubelleData: Poubelle) => {
    if (poubelleData.id) {
      // Modification
      setPoubelles(poubelles.map(p => p.id === poubelleData.id ? poubelleData : p));
    } else {
      // Ajout
      const newPoubelle = { ...poubelleData, id: Date.now() };
      setPoubelles([...poubelles, newPoubelle]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-gray-50 min-h-screen">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion du Parc des Poubelles</h1>
          <p className="text-sm text-gray-500">Suivi en temps réel et configuration de l'infrastructure</p>
        </div>
        <button
          onClick={handleAddClick}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg transition shadow-sm"
        >
          + Ajouter une poubelle
        </button>
      </div>

      {/* Tableau des poubelles */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-600 text-sm font-semibold border-b border-gray-200">
              <th className="p-4">Nom / ID</th>
              <th className="p-4">Type</th>
              <th className="p-4">Localisation</th>
              <th className="p-4">Remplissage</th>
              <th className="p-4">Statut</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {poubelles.map((poubelle) => (
              <tr key={poubelle.id} className="hover:bg-gray-50 transition">
                <td className="p-4 font-medium text-gray-900">{poubelle.nom}</td>
                <td className="p-4">
                  <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700">
                    {poubelle.type}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-500">{poubelle.localisation}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          poubelle.remplissage > 80 ? 'bg-red-500' : poubelle.remplissage > 50 ? 'bg-amber-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${poubelle.remplissage}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-semibold">{poubelle.remplissage}%</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-md ${
                    poubelle.statut === 'Plein' ? 'bg-red-100 text-red-700' :
                    poubelle.statut === 'Maintenance' ? 'bg-amber-100 text-amber-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {poubelle.statut}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleEditClick(poubelle)}
                    className="text-indigo-600 hover:text-indigo-900 font-medium text-sm mr-2"
                  >
                    Modifier
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Rendu conditionnel de la Popup */}
      {isModalOpen && (
        <PoubelleModal
          poubelleInitiale={selectedPoubelle}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default GestionPoubelles;