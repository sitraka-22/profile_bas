import React, { useState, useEffect } from "react";
import api from "../service/api";

interface Ressource {
  id_ressource: number;
  nom_ressource: string;
  categorie: "Engin" | "Outillage" | "Materiau";
  quantite_disponible: number;
  id_projet: number | null;
  nom_projet?: string | null;
}

interface Projet {
  id_projet: number;
  nom_projet: string;
}

interface Toast {
  id: number;
  type: "success" | "error" | "info";
  message: string;
}

const RessourcesManager: React.FC = () => {
  const [ressources, setRessources] = useState<Ressource[]>([]);
  const [projets, setProjets] = useState<Projet[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Onglets actifs : "Tous", "Engin", "Outillage", "Materiau" ou "Corbeille"
  const [currentTab, setCurrentTab] = useState<string>("Tous");

  // États pour la recherche et la pagination
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Gestion de la boîte modale d'ajout
  const [isModalOpen, setIsModalOpen] = useState(false);

  // États du formulaire d'ajout
  const [nom, setNom] = useState("");
  const [categorie, setCategorie] = useState<
    "Engin" | "Outillage" | "Materiau"
  >("Engin");
  const [quantite, setQuantite] = useState<number>(1);

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Réinitialiser la recherche et la page active lors du changement d'onglet
  useEffect(() => {
    setSearchTerm("");
    setCurrentPage(1);
  }, [currentTab]);

  // Fonction pour afficher un popup en haut à droite
  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "success",
  ) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const fetchInitialData = async () => {
    try {
      const [ressourcesRes, projetsRes] = await Promise.all([
        api.get("/ressources"),
        api.get("/projets"),
      ]);
      setRessources(ressourcesRes.data);
      setProjets(projetsRes.data);
    } catch (error: any) {
      console.error(error);
      showToast("Erreur lors de la récupération des données.", "error");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post("/ressources", {
        nom_ressource: nom,
        categorie,
        quantite_disponible: Number(quantite),
      });

      if (response.status === 201 || response.status === 200) {
        const nouvelleRessource = response.data;
        setRessources((prev) => [nouvelleRessource, ...prev]);

        setNom("");
        setQuantite(1);
        setIsModalOpen(false);
        showToast(
          `Ressource "${nouvelleRessource.nom_ressource}" ajoutée avec succès !`,
          "success",
        );
      }
    } catch (error: any) {
      console.error(error.response?.data);
      showToast(
        error.response?.data?.error || "Erreur lors de l'ajout.",
        "error",
      );
    }
  };

  const handleAffectation = async (
    id_ressource: number,
    id_projet_selectionne: string,
  ) => {
    const id_projet =
      id_projet_selectionne === "null"
        ? null
        : parseInt(id_projet_selectionne, 10);

    try {
      const response = await api.patch(`/ressources/${id_ressource}`, {
        id_projet,
      });

      if (response.status === 200) {
        setRessources((prevRessources) =>
          prevRessources.map((ressource) => {
            if (ressource.id_ressource === id_ressource) {
              const projetAssocie = projets.find(
                (p) => p.id_projet === id_projet,
              );
              return {
                ...ressource,
                id_projet: id_projet,
                nom_projet: projetAssocie ? projetAssocie.nom_projet : null,
              };
            }
            return ressource;
          }),
        );
        showToast("Affectation du chantier mise à jour.", "success");
      }
    } catch (error: any) {
      console.error(error);
      showToast("Impossible d'affecter cette ressource au chantier.", "error");
    }
  };

  // Envoi à la corbeille (Soft Delete)
  const handleSoftDelete = async (id: number, nomRessource: string) => {
    if (
      window.confirm(
        `Voulez-vous masquer "${nomRessource}" et l'envoyer à la corbeille ?`,
      )
    ) {
      try {
        const response = await api.delete(`/ressources/${id}`);
        if (response.status === 200) {
          setRessources((prev) =>
            prev.map((r) =>
              r.id_ressource === id ? ({ ...r, is_delete: true } as any) : r,
            ),
          );
          showToast(`"${nomRessource}" déplacée dans la corbeille.`, "info");
        }
      } catch (error) {
        showToast("Erreur lors de l'envoi à la corbeille.", "error");
      }
    }
  };

  // Restauration depuis la corbeille
  const handleRestore = async (id: number, nomRessource: string) => {
    try {
      const response = await api.patch(`/ressources/${id}/restore`, {});
      if (response.status === 200) {
        setRessources((prev) =>
          prev.map((r) =>
            r.id_ressource === id ? ({ ...r, is_delete: false } as any) : r,
          ),
        );
        showToast(
          `"${nomRessource}" a été restaurée dans le parc actif.`,
          "success",
        );
      }
    } catch (error) {
      showToast("Erreur lors de la restauration.", "error");
    }
  };

  // Suppression Définitive (Hard Delete)
  const handleHardDelete = async (id: number, nomRessource: string) => {
    if (
      window.confirm(
        `⚠️ ATTENTION : Voulez-vous supprimer définitivement "${nomRessource}" ? Cette action est irréversible.`,
      )
    ) {
      try {
        const response = await api.delete(`/ressources/${id}/permanent`);
        if (response.status === 200) {
          setRessources((prev) => prev.filter((r) => r.id_ressource !== id));
          showToast(
            `"${nomRessource}" a été définitivement supprimée.`,
            "success",
          );
        }
      } catch (error) {
        showToast("Erreur lors de la suppression définitive.", "error");
      }
    }
  };

  // 1. Étape de Filtrage (Onglets + Recherche)
  const filteredRessources = ressources.filter((r: any) => {
    // Filtrage par onglet / corbeille
    let matchesTab = false;
    if (currentTab === "Corbeille") {
      matchesTab = r.is_delete === true;
    } else {
      if (r.is_delete === true) matchesTab = false;
      else if (currentTab === "Tous") matchesTab = true;
      else matchesTab = r.categorie === currentTab;
    }

    // Filtrage par terme de recherche
    const matchesSearch = r.nom_ressource
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchesTab && matchesSearch;
  });

  // 2. Étape de Pagination (Calcul des index)
  const totalItems = filteredRessources.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRessources.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen relative">
      {/* ZONE DES POPUPS (TOASTS) EN HAUT À DROITE */}
      <div className="fixed top-5 right-5 z-50 space-y-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-lg border text-sm font-medium flex justify-between items-center transform animate-in fade-in slide-in-from-top-4 duration-200 ${
              toast.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : toast.type === "error"
                  ? "bg-red-50 border-red-200 text-red-800"
                  : "bg-blue-50 border-blue-200 text-blue-800"
            }`}
          >
            <span>{toast.message}</span>
            <button
              onClick={() =>
                setToasts((prev) => prev.filter((t) => t.id !== toast.id))
              }
              className="ml-4 text-gray-400 hover:text-gray-600 font-bold"
            >
              &times;
            </button>
          </div>
        ))}
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* En-tête */}
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

        {/* Barre d'outils : Onglets & Recherche */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Navigation Onglets */}
          <div className="flex flex-wrap gap-2 bg-white p-1.5 rounded-lg shadow-sm border w-full md:w-auto">
            {["Tous", "Engin", "Outillage", "Materiau", "Corbeille"].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setCurrentTab(tab)}
                  className={`px-4 py-2 text-xs md:text-sm font-medium rounded-md transition-all duration-200 ${
                    currentTab === tab
                      ? tab === "Corbeille"
                        ? "bg-red-50 text-red-600 shadow-sm"
                        : "bg-blue-50 text-blue-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {tab === "Tous"
                    ? "🌐 Tous les stocks"
                    : tab === "Materiau"
                      ? "🧱 Matériaux"
                      : tab === "Corbeille"
                        ? "🗑️ Corbeille"
                        : `🛠️ ${tab}s`}
                </button>
              ),
            )}
          </div>

          {/* Champ de recherche */}
          <div className="w-full md:w-72 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Retour à la page 1 lors d'une recherche
              }}
              placeholder={`Rechercher dans ${currentTab === "Tous" ? "tous les stocks" : currentTab.toLowerCase()}...`}
              className="w-full text-sm pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white"
            />
            <span className="absolute left-3 top-2.5 text-gray-400 text-sm">
              🔍
            </span>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-2 text-gray-400 hover:text-gray-600 font-bold text-sm"
              >
                &times;
              </button>
            )}
          </div>
        </div>

        {/* Tableau principal */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100/70 text-gray-600 uppercase text-xs tracking-wider font-semibold">
                  <th className="py-3 px-6">Ressource</th>
                  <th className="py-3 px-6">Catégorie</th>
                  <th className="py-3 px-6 text-center">Quantité</th>
                  <th className="py-3 px-6">
                    {currentTab === "Corbeille"
                      ? "Statut Corbeille"
                      : "Affectation Chantier"}
                  </th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
                {currentItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-8 text-gray-400 italic"
                    >
                      Aucune ressource trouvée.
                    </td>
                  </tr>
                ) : (
                  currentItems.map((r) => (
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
                        {currentTab === "Corbeille" ? (
                          <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded">
                            Masqué
                          </span>
                        ) : (
                          <select
                            value={r.id_projet || "null"}
                            onChange={(e) =>
                              handleAffectation(r.id_ressource, e.target.value)
                            }
                            className="w-full text-sm px-2 py-1 border border-gray-300 rounded bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          >
                            <option value="null">
                              📦 Aucun chantier (En Stock)
                            </option>
                            {projets.map((p) => (
                              <option key={p.id_projet} value={p.id_projet}>
                                🏗️ {p.nom_projet}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        {currentTab === "Corbeille" ? (
                          <>
                            <button
                              onClick={() =>
                                handleRestore(r.id_ressource, r.nom_ressource)
                              }
                              className="text-green-600 hover:text-green-800 font-medium text-xs transition"
                            >
                              Restaurer
                            </button>
                            <button
                              onClick={() =>
                                handleHardDelete(
                                  r.id_ressource,
                                  r.nom_ressource,
                                )
                              }
                              className="text-red-600 hover:text-red-900 font-bold text-xs transition ml-2"
                            >
                              Supprimer définitivement
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() =>
                              handleSoftDelete(r.id_ressource, r.nom_ressource)
                            }
                            className="text-amber-600 hover:text-amber-800 font-medium text-xs transition"
                          >
                            Mettre à la corbeille
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* BLOC PAGINATION (Uniquement si plusieurs pages nécessaires) */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Précédent
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Suivant
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs text-gray-500">
                    Affichage de{" "}
                    <span className="font-semibold text-gray-700">
                      {indexOfFirstItem + 1}
                    </span>{" "}
                    à{" "}
                    <span className="font-semibold text-gray-700">
                      {Math.min(indexOfLastItem, totalItems)}
                    </span>{" "}
                    sur{" "}
                    <span className="font-semibold text-gray-700">
                      {totalItems}
                    </span>{" "}
                    ressources
                  </p>
                </div>
                <div>
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-xs -space-x-px"
                    aria-label="Pagination"
                  >
                    {/* Bouton Précédent */}
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                    >
                      <span>◀</span>
                    </button>

                    {/* Boutons Numériques */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-3.5 py-2 border text-xs font-semibold ${
                            currentPage === page
                              ? "z-10 bg-blue-600 border-blue-600 text-white"
                              : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      ),
                    )}

                    {/* Bouton Suivant */}
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                    >
                      <span>▶</span>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BOÎTE MODALE D'AJOUT */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl border max-w-md w-full overflow-hidden">
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
                  className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Catégorie
                </label>
                <select
                  value={categorie}
                  onChange={(e) => setCategorie(e.target.value as any)}
                  className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
