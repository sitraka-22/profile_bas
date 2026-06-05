import { useEffect, useState } from 'react';
import api from '../service/api';

interface Projet {
  id: number;
  nom: string;
  description: string;
  budget: number;
  date_debut: string;
}

export default function ListeProjets() {
  const [projets, setProjets] = useState<Projet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProjets = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/projets');
      setProjets(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des données', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjets();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#1a365d]">Liste des Chantiers</h2>
          <p className="text-gray-500 text-sm">Tous les projets enregistrés dans la base de données PostgreSQL.</p>
        </div>
        <button 
          onClick={fetchProjets}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg text-sm transition-colors cursor-pointer"
        >
          Rafraîchir
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500 text-sm">Chargement des données en cours...</div>
        ) : projets.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">Aucun chantier trouvé dans la base de données.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs font-bold text-gray-400 uppercase border-b border-gray-100">
                <tr>
                  <th className="p-4">Nom du Projet</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Budget</th>
                  <th className="p-4">Date de Début</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {projets.map((projet) => (
                  <tr key={projet.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="p-4 font-semibold text-gray-800">{projet.nom}</td>
                    <td className="p-4 max-w-xs truncate">{projet.description}</td>
                    <td className="p-4 font-mono text-green-600">{projet.budget.toLocaleString()} €</td>
                    <td className="p-4">{new Date(projet.date_debut).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}