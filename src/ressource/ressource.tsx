import React, { useState, useEffect } from "react";
import api from "../service/api";

interface Ressource {
  id_ressource: number;
  nom_ressource: string;
  categorie: "Engin" | "Outillage" | "Materiau";
  quantite_disponible: number;
  id_projet: number | null;
  nom_projet?: string | null;
  is_delete?: boolean;
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

// Type pour configurer notre boîte de dialogue de confirmation personnalisée
interface ConfirmDialog {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  confirmStyle: "danger" | "warning" | "primary";
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

  // Gestion des boîtes modales (Ajout et Édition)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRessource, setEditingRessource] = useState<Ressource | null>(
    null,
  );

  // Configuration de la boîte de dialogue de confirmation personnalisée
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    confirmStyle: "primary",
  });

  // États du formulaire (Partagés/Réinitialisés selon le contexte)
  const [nom, setNom] = useState("");
  const [categorie, setCategorie] = useState<
    "Engin" | "Outillage" | "Materiau"
  >("Engin");
  const [quantite, setQuantite] = useState<number>(1);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    setSearchTerm("");
    setCurrentPage(1);
  }, [currentTab]);

  // Fonction renforcée pour afficher un popup (Toast) thématique
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

  // Déclencheur de la boîte de dialogue de confirmation personnalisée (Remplace window.confirm)
  const askConfirmation = (
    title: string,
    message: string,
    confirmStyle: "danger" | "warning" | "primary",
    onConfirm: () => void,
  ) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
      confirmStyle,
    });
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

  const handleOpenAddModal = () => {
    setNom("");
    setCategorie("Engin");
    setQuantite(1);
    setIsModalOpen(true);
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

  const handleOpenEditModal = (ressource: Ressource) => {
    setEditingRessource(ressource);
    setNom(ressource.nom_ressource);
    setCategorie(ressource.categorie);
    setQuantite(ressource.quantite_disponible);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRessource) return;

    try {
      // On passe l'ensemble des données modifiées à l'API
      const response = await api.patch(
        `/ressources/${editingRessource.id_ressource}`,
        {
          nom_ressource: nom,
          categorie,
          quantite_disponible: Number(quantite),
        },
      );

      if (response.status === 200) {
        setRessources((prev) =>
          prev.map((r) =>
            r.id_ressource === editingRessource.id_ressource
              ? {
                  ...r,
                  nom_ressource: nom,
                  categorie,
                  quantite_disponible: Number(quantite),
                }
              : r,
          ),
        );
        setIsEditModalOpen(false);
        setEditingRessource(null);
        showToast("Ressource mise à jour avec succès !", "success");
      }
    } catch (error: any) {
      console.error(error);
      showToast("Erreur lors de la modification de la ressource.", "error");
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

  const handleSoftDelete = (id: number, nomRessource: string) => {
    askConfirmation(
      "Mettre à la corbeille ?",
      `Voulez-vous vraiment masquer "${nomRessource}" et l'envoyer dans l'onglet corbeille ?`,
      "warning",
      async () => {
        try {
          const response = await api.delete(`/ressources/${id}`);
          if (response.status === 200) {
            setRessources((prev) =>
              prev.map((r) =>
                r.id_ressource === id ? { ...r, is_delete: true } : r,
              ),
            );
            showToast(`"${nomRessource}" déplacée dans la corbeille.`, "info");
          }
        } catch (error) {
          showToast("Erreur lors de l'envoi à la corbeille.", "error");
        }
      },
    );
  };

  const handleRestore = async (id: number, nomRessource: string) => {
    try {
      const response = await api.patch(`/ressources/${id}/restore`, {});
      if (response.status === 200) {
        setRessources((prev) =>
          prev.map((r) =>
            r.id_ressource === id ? { ...r, is_delete: false } : r,
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

  const handleHardDelete = (id: number, nomRessource: string) => {
    askConfirmation(
      "⚠️ Suppression définitive",
      `Êtes-vous sûr de vouloir détruire définitivement "${nomRessource}" ? Cette action effacera la ressource de la base de données de manière irréversible.`,
      "danger",
      async () => {
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
      },
    );
  };

  // Filtrage
  const filteredRessources = ressources.filter((r) => {
    let matchesTab = false;
    if (currentTab === "Corbeille") {
      matchesTab = r.is_delete === true;
    } else {
      if (r.is_delete === true) matchesTab = false;
      else if (currentTab === "Tous") matchesTab = true;
      else matchesTab = r.categorie === currentTab;
    }
    const matchesSearch = r.nom_ressource
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Pagination
  const totalItems = filteredRessources.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRessources.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen relative select-none">
      {/* ZONE DESIGN DES POPUPS (TOASTS) EN HAUT À DROITE */}
      <div className="fixed top-5 right-5 z-50 space-y-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-xl border text-sm font-medium flex gap-3 items-start transform animate-in fade-in slide-in-from-top-4 duration-200 bg-white ${
              toast.type === "success"
                ? "border-green-200 text-green-900 shadow-green-100/50"
                : toast.type === "error"
                  ? "border-red-200 text-red-900 shadow-red-100/50"
                  : "border-blue-200 text-blue-900 shadow-blue-100/50"
            }`}
          >
            {/* Icônes adaptées dynamiquement au type d'alerte */}
            <div className="mt-0.5 shrink-0">
              {toast.type === "success" && (
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
              {toast.type === "error" && (
                <svg
                  className="w-5 h-5 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              )}
              {toast.type === "info" && (
                <svg
                  className="w-5 h-5 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </div>
            <div className="flex-1">{toast.message}</div>
            <button
              onClick={() =>
                setToasts((prev) => prev.filter((t) => t.id !== toast.id))
              }
              className="text-gray-400 hover:text-gray-600 transition font-bold"
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
            onClick={handleOpenAddModal}
            className="inline-flex items-center justify-center bg-[#1a365d] hover:bg-[#10223b] text-white font-medium text-sm py-2.5 px-4 rounded-lg shadow transition duration-150 active:scale-95"
          >
            ➕ Ajouter une ressource
          </button>
        </div>

        {/* Barre d'outils : Onglets & Recherche */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
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
                        : "bg-blue-50 text-[#1a365d] shadow-sm font-bold"
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

          <div className="w-full md:w-72 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={`Rechercher...`}
              className="w-full text-sm pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm bg-white"
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
                  <th className="py-3 px-6 text-center">Actions</th>
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
                      {/* COLONNE D'ACTIONS AMÉLIORÉE */}
                      <td className="py-4 px-6 text-center space-x-3">
                        {currentTab === "Corbeille" ? (
                          <>
                            <button
                              onClick={() =>
                                handleRestore(r.id_ressource, r.nom_ressource)
                              }
                              className="text-green-600 hover:text-green-800 font-bold text-xs transition"
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
                              className="text-red-500 hover:text-red-700 font-bold text-xs transition"
                            >
                              Supprimer définitivement
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleOpenEditModal(r)}
                              className="text-blue-600 hover:text-blue-800 font-bold text-xs transition"
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() =>
                                handleSoftDelete(
                                  r.id_ressource,
                                  r.nom_ressource,
                                )
                              }
                              className="text-amber-600 hover:text-amber-800 font-medium text-xs transition"
                            >
                              Mettre à la corbeille
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <p className="text-xs text-gray-500">
                  Affichage de{" "}
                  <span className="font-semibold">{indexOfFirstItem + 1}</span>{" "}
                  à{" "}
                  <span className="font-semibold">
                    {Math.min(indexOfLastItem, totalItems)}
                  </span>{" "}
                  sur <span className="font-semibold">{totalItems}</span>{" "}
                  ressources
                </p>
                <nav className="relative z-0 inline-flex rounded-md shadow-xs -space-x-px">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-2 py-2 rounded-l-md border border-gray-300 bg-white text-gray-500 disabled:opacity-40"
                  >
                    ◀
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3.5 py-2 border text-xs font-semibold ${currentPage === page ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                      >
                        {page}
                      </button>
                    ),
                  )}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="px-2 py-2 rounded-r-md border border-gray-300 bg-white text-gray-500 disabled:opacity-40"
                  >
                    ▶
                  </button>
                </nav>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BOÎTE MODALE PERSONNALISÉE : DEMANDE DE CONFIRMATION (REMPLACE WINDOW.CONFIRM) */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border max-w-sm w-full overflow-hidden p-6 space-y-4 transform animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-gray-900">
              {confirmDialog.title}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {confirmDialog.message}
            </p>
            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() =>
                  setConfirmDialog((prev) => ({ ...prev, isOpen: false }))
                }
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-xs rounded-lg transition"
              >
                Annuler
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className={`px-4 py-2 text-white font-medium text-xs rounded-lg transition shadow-sm ${
                  confirmDialog.confirmStyle === "danger"
                    ? "bg-red-600 hover:bg-red-700"
                    : confirmDialog.confirmStyle === "warning"
                      ? "bg-amber-500 hover:bg-amber-600"
                      : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE REFACTORISÉE D'AJOUT & DE MODIFICATION */}
      {(isModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-40">
          <div className="bg-white rounded-xl shadow-xl border max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800">
                {isEditModalOpen
                  ? "Modifier la ressource"
                  : "Ajouter une ressource"}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setIsEditModalOpen(false);
                }}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form
              onSubmit={isEditModalOpen ? handleUpdate : handleCreate}
              className="p-6 space-y-4"
            >
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
                  Quantité
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
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm py-2 px-4 rounded-lg transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-[#1a365d] hover:bg-[#10223b] text-white font-medium text-sm py-2 px-4 rounded-lg shadow transition"
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
