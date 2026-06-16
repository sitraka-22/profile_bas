import React, { useState, useEffect } from "react";
import api from "../service/api";

interface Ressource {
  id_ressource: number;
  nom_ressource: string;
  categorie: "Engin" | "Outillage" | "Materiau"; // Strictement identique à ton ENUM PostgreSQL
  quantite_disponible: number;
  id_projet: number | null;
  nom_projet?: string | null;
}

interface Projet {
  id_projet: number;
  nom_projet: string;
}

const RessourcesManager: React.FC = () => {
  const [ressources, setRessources] = useState<Ressource[]>([]);
  const [projets, setProjets] = useState<Projet[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Onglet/Sous-menu de filtrage actif
  const [currentTab, setCurrentTab] = useState<string>("Tous");

  // Gestion de l'affichage de la boîte modale (Prompt d'ajout)
  const [isModalOpen, setIsModalOpen] = useState(false);

  // États du formulaire
  const [nom, setNom] = useState("");
  const [categorie, setCategorie] = useState<
    "Engin" | "Outillage" | "Materiau"
  >("Engin");
  const [quantite, setQuantite] = useState<number>(1);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setErrorMsg(null);
      const [ressourcesRes, projetsRes] = await Promise.all([
        api.get("/ressources"),
        api.get("/projets"),
      ]);
      setRessources(ressourcesRes.data);
      setProjets(projetsRes.data);
    } catch (error: any) {
      console.error(error);
      setErrorMsg("Erreur lors de la récupération des données.");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setErrorMsg(null);
      const response = await api.post("/ressources", {
        nom_ressource: nom,
        categorie,
        quantite_disponible: Number(quantite),
      });

      if (response.status === 201 || response.status === 200) {
        const nouvelleRessource = response.data;

        // On l'ajoute directement à l'état local pour rafraîchir l'interface sans ré-exécuter un GET
        setRessources((prev) => [nouvelleRessource, ...prev]);

        // Réinitialisation de la boîte modale
        setNom("");
        setQuantite(1);
        setIsModalOpen(false);
      }
    } catch (error: any) {
      console.error("Détails de l'erreur 500 :", error.response?.data);
      setErrorMsg(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Erreur lors de l'ajout.",
      );
    }
  };

 const handleAffectation = async (id_ressource: number, id_projet_selectionne: string) => {
  // Convertit la chaîne "null" en vrai type null JavaScript, ou en entier (base 10)
  const id_projet = id_projet_selectionne === "null" ? null : parseInt(id_projet_selectionne, 10);
  
  try {
    setErrorMsg(null);
    
    // 🛠️ CORRECTION DE L'URL : Ajout du préfixe global '/api'
    const response = await api.patch(`/api/ressources/${id_ressource}`, { id_projet });
    
    if (response.status === 200) {
      // 🚀 OPTIMISATION : Mise à jour de l'état local sans ré-exécuter un GET complet
      setRessources((prevRessources) =>
        prevRessources.map((ressource) => {
          if (ressource.id_ressource === id_ressource) {
            // On cherche le projet sélectionné dans notre liste pour récupérer son nom
            const projetAssocie = projets.find(p => p.id_projet === id_projet);
            
            return {
              ...ressource,
              id_projet: id_projet,
              nom_projet: projetAssocie ? projetAssocie.nom_projet : null
            };
          }
          return ressource;
        })
      );
    }
  } catch (error: any) {
    console.error("Erreur lors de l'affectation :", error.response?.data || error.message);
    setErrorMsg(
      error.response?.data?.error || 
      "Impossible d'affecter cette ressource au chantier. Vérifie la connexion au serveur."
    );
  }
};

  const handleDelete = async (id: number) => {
    if (
      window.confirm(
        "Voulez-vous masquer/supprimer ce matériel du parc actif ?",
      )
    ) {
      try {
        const response = await api.delete(`/ressources/${id}`);
        if (response.status === 200) {
          setRessources(ressources.filter((r) => r.id_ressource !== id));
        }
      } catch (error) {
        setErrorMsg("Erreur lors de la suppression.");
      }
    }
  };

  // Filtrage des ressources selon le sous-menu (onglet) sélectionné
  const filteredRessources = ressources.filter((r) => {
    if (currentTab === "Tous") return true;
    if (currentTab === "Engin") return r.categorie === "Engin";
    if (currentTab === "Outillage") return r.categorie === "Outillage";
    if (currentTab === "Materiau") return r.categorie === "Materiau";
    return true;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen relative">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* En-tête avec bouton d'ouverture du Prompt Modal */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-200 pb-4 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
              Gestion du Parc Matériel & Ressources
            </h1>
            <p className="text-sm text-gray-500">
              Suivi sécurisé des stocks et des chantiers COLASS.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2.5 px-4 rounded-lg shadow transition duration-150 active:scale-95"
          >
            ➕ Ajouter une ressource
          </button>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        {/* Sous-menus / Onglets de navigation par Catégories */}
        <div className="flex border-b border-gray-200 space-x-2 bg-white p-1.5 rounded-lg shadow-sm border">
          {["Tous", "Engin", "Outillage", "Materiau"].map((tab) => (
            <button
              key={tab}
              onClick={() => setCurrentTab(tab)}
              className={`px-4 py-2 text-xs md:text-sm font-medium rounded-md transition-all duration-200 ${
                currentTab === tab
                  ? "bg-blue-50 text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              {tab === "Tous"
                ? "🌐 Tous les stocks"
                : tab === "Materiau"
                  ? "🧱 Matériaux"
                  : `🛠️ ${tab}s`}
            </button>
          ))}
        </div>

        {/* Tableau des ressources */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100/70 text-gray-600 uppercase text-xs tracking-wider font-semibold">
                  <th className="py-3 px-6">Ressource</th>
                  <th className="py-3 px-6">Catégorie</th>
                  <th className="py-3 px-6 text-center">Quantité</th>
                  <th className="py-3 px-6">Affectation Chantier (PATCH)</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
                {filteredRessources.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-8 text-gray-400 italic"
                    >
                      Aucune ressource trouvée dans cette catégorie.
                    </td>
                  </tr>
                ) : (
                  filteredRessources.map((r) => (
                    <tr
                      key={r.id_ressource}
                      className="hover:bg-gray-50/70 transition"
                    >
                      <td className="py-4 px-6 font-medium text-gray-900">
                        {r.nom_ressource}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            r.categorie === "Engin"
                              ? "bg-amber-100 text-amber-800"
                              : r.categorie === "Outillage"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {r.categorie}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center font-semibold text-gray-600">
                        {r.quantite_disponible}
                      </td>
                      <td className="py-4 px-6">
                        <select
                          value={categorie}
                          onChange={(e) => setCategorie(e.target.value as any)}
                          className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                          <option value="Engin">Engin</option>
                          <option value="Outillage">Outillage</option>
                          <option value="Materiau">Materiau</option>{" "}
                        </select>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleDelete(r.id_ressource)}
                          className="text-red-500 hover:text-red-700 font-medium text-xs transition"
                        >
                          Retirer
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* BOÎTE MODALE : PROMPT D'AJOUT DE RESSOURCE */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl border max-w-md w-full overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800">
                Ajouter une ressource
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Nom du matériel / matériau
                </label>
                <input
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Ex: Excavatrice CAT 320"
                  className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Catégorie (ENUM)
                </label>
                <select
                  value={categorie}
                  onChange={(e) => setCategorie(e.target.value as any)}
                  className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Engin">Engin</option>
                  <option value="Outillage">Outillage</option>
                  <option value="Materiau">Materiau (Sable, Ciment...)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Quantité initiale
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantite}
                  onChange={(e) =>
                    setQuantite(parseInt(e.target.value, 10) || 1)
                  }
                  className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex space-x-3 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm py-2 px-4 rounded-lg transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2 px-4 rounded-lg shadow transition"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RessourcesManager;
