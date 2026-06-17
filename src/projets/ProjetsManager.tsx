import React, { useState, useEffect } from "react";
import api from "../service/api";
import AddProjetModal from "./AddProjetModal";
import EditProjetModal from "./EditProjetModal";
import ProjetsChart from "./ProjetsChart";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { ProjetsPdfDocument } from "../service/ProjetsPdfDocument";

interface Projet {
  id_projet: number;
  nom_projet: string;
  description: string;
  type: "Route" | "Batiment" | "Pont";
  date_debut: string | null;
  date_fin_prevue: string | null;
  budget: number | null;
  is_deleted: boolean;
}

// Interface pour gérer nos notifications personnalisées
interface ToastNotification {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

const ProjetsManager: React.FC = () => {
  const [projets, setProjets] = useState<Projet[]>([]);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProjet, setSelectedProjet] = useState<Projet | null>(null);
  const [viewTab, setViewTab] = useState<"Actifs" | "Corbeille">("Actifs");
  const [typeFilter, setTypeFilter] = useState<string>("Tous");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // États pour notre modal de confirmation personnalisé
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isDanger: boolean;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    isDanger: false,
  });

  useEffect(() => {
    fetchProjets();
  }, []);

  // Fonction pour déclencher un toast en haut à droite
  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "success",
  ) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000); // Disparaît après 4 secondes
  };

  const fetchProjets = async () => {
    try {
      const response = await api.get("/projets");
      setProjets(response.data);
    } catch (error: any) {
      console.error(error);
      showToast("Impossible de récupérer la liste des chantiers.", "error");
    }
  };

  const handleProjectCreated = (nouveauProjet: Projet) => {
    setProjets((prev) => [nouveauProjet, ...prev]);
    showToast("Le nouveau chantier a été initié avec succès ! 🎉", "success");
  };

  const handleProjectUpdated = (projetMisAJour: Projet) => {
    setProjets((prev) =>
      prev.map((p) =>
        p.id_projet === projetMisAJour.id_projet ? projetMisAJour : p,
      ),
    );
    showToast("Les spécifications du projet ont été mises à jour.", "success");
  };

  const handleSoftDelete = (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: "Mettre en corbeille",
      message:
        "Êtes-vous sûr de vouloir déplacer ce chantier dans la corbeille ? Les opérations en cours seront suspendues.",
      isDanger: true,
      onConfirm: async () => {
        try {
          const response = await api.delete(`/projets/${id}`);
          if (response.status === 200) {
            setProjets((prev) =>
              prev.map((p) =>
                p.id_projet === id ? { ...p, is_deleted: true } : p,
              ),
            );
            showToast("Projet déplacé dans la corbeille.", "info");
          }
        } catch (error) {
          showToast("Erreur lors de la mise en corbeille.", "error");
        }
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleRestore = async (id: number) => {
    try {
      const response = await api.patch(`/projets/${id}/restaurer`);
      if (response.status === 200) {
        setProjets((prev) =>
          prev.map((p) =>
            p.id_projet === id ? { ...p, is_deleted: false } : p,
          ),
        );
        showToast(
          "Le chantier a été réintégré dans la liste active.",
          "success",
        );
      }
    } catch (error) {
      showToast("Erreur lors de la restauration du chantier.", "error");
    }
  };

  const handleSupprimerDefinitif = (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: "⚠️ Suppression Définitive",
      message:
        "Attention ! Cette action est irréversible. Toutes les données budgétaires et fiches associées à ce lot COLASS seront effacées.",
      isDanger: true,
      onConfirm: async () => {
        try {
          const response = await api.delete(`/projets/${id}/definitif`);
          if (response.status === 200) {
            setProjets((prev) => prev.filter((p) => p.id_projet !== id));
            showToast(
              "Le projet a été supprimé définitivement de la base de données.",
              "success",
            );
          }
        } catch (error) {
          showToast("Erreur lors de la suppression définitive.", "error");
        }
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const projectsToDisplay = projets.filter((p) => {
    const matchView = viewTab === "Actifs" ? !p.is_deleted : p.is_deleted;
    const matchType = typeFilter === "Tous" ? true : p.type === typeFilter;
    const search = searchQuery.toLowerCase().trim();
    const matchSearch =
      search === ""
        ? true
        : p.nom_projet.toLowerCase().includes(search) ||
          p.description?.toLowerCase().includes(search);
    return matchView && matchType && matchSearch;
  });

  const formatBudget = (amount: number | null) => {
    if (!amount) return "Non spécifié";
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen relative font-sans">
      {/* Container de POPUP ALERTE (Toasts) en Haut à Droite */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center p-4 rounded-xl shadow-xl border backdrop-blur-md transition-all duration-300 transform translate-x-0 animate-fade-in-right ${
              t.type === "success"
                ? "bg-emerald-50/95 border-emerald-200 text-emerald-900"
                : t.type === "error"
                  ? "bg-red-50/95 border-red-200 text-red-900"
                  : "bg-blue-50/95 border-blue-200 text-blue-900"
            }`}
          >
            <div className="text-lg mr-3">
              {t.type === "success" && "✅"}
              {t.type === "error" && "❌"}
              {t.type === "info" && "ℹ️"}
            </div>
            <div className="text-xs font-semibold flex-1 leading-snug">
              {t.message}
            </div>
            <button
              onClick={() =>
                setToasts((prev) => prev.filter((item) => item.id !== t.id))
              }
              className="ml-4 text-gray-400 hover:text-gray-700 text-sm font-bold"
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
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Suivi des Chantiers & Infrastructures
            </h1>
            <p className="text-sm text-gray-500">
              Planification des chantiers routiers, ponts et bâtiments COLASS.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {projectsToDisplay.length > 0 && (
              <PDFDownloadLink
                document={
                  <ProjetsPdfDocument
                    projets={projectsToDisplay}
                    titre={`Rapport Chantiers (${viewTab})`}
                  />
                }
                fileName={`Rapport_COLASS_${viewTab.toLowerCase()}.pdf`}
                className="inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm py-2.5 px-4 rounded-xl shadow-lg shadow-emerald-200 transition duration-150 active:scale-95"
              >
                {({ loading }) =>
                  loading ? "📄 Génération..." : "📥 Télécharger PDF"
                }
              </PDFDownloadLink>
            )}
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2.5 px-4 rounded-xl shadow-lg shadow-blue-200 transition duration-150 active:scale-95"
            >
              ➕ Lancer un chantier
            </button>
          </div>
        </div>

        {/* Section Graphique */}
        <ProjetsChart projets={projets} />

        {/* Double sous-menu + barre de recherche */}
        <div className="flex flex-col gap-3 bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setViewTab("Actifs")}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${viewTab === "Actifs" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
              >
                🏗️ Chantiers Actifs
              </button>
              <button
                onClick={() => setViewTab("Corbeille")}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${viewTab === "Corbeille" ? "bg-red-50 text-red-600 shadow-sm" : "text-gray-500 hover:text-red-600"}`}
              >
                🗑️ Corbeille
              </button>
            </div>

            <div className="flex items-center space-x-1 bg-gray-50 p-1 rounded-xl border border-gray-200/40">
              {["Tous", "Route", "Batiment", "Pont"].map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTypeFilter(t);
                    setSearchQuery("");
                  }}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition ${typeFilter === t ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:bg-gray-200/70 hover:text-gray-700"}`}
                >
                  {t === "Tous"
                    ? "Tout voir"
                    : t === "Batiment"
                      ? "Bâtiments"
                      : t + "s"}
                </button>
              ))}
            </div>
          </div>

          {typeFilter !== "Tous" && (
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                🔍
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Rechercher un ${typeFilter === "Batiment" ? "bâtiment" : typeFilter.toLowerCase()}...`}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 bg-gray-50 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg font-bold"
                >
                  ×
                </button>
              )}
            </div>
          )}
        </div>

        {/* Grille de cartes */}
        {projectsToDisplay.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-16 text-center text-gray-400 italic">
            Aucun projet correspondant aux filtres sélectionnés.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projectsToDisplay.map((p) => (
              <div
                key={p.id_projet}
                className={`bg-white rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between overflow-hidden ${p.is_deleted ? "border-red-100 shadow-sm bg-red-50/10" : "border-gray-100 shadow-sm"}`}
              >
                <div className="p-5 space-y-4">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-gray-900 tracking-tight text-base line-clamp-2">
                      {p.nom_projet}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${p.type === "Route" ? "bg-amber-100 text-amber-800" : p.type === "Batiment" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}`}
                    >
                      {p.type === "Route"
                        ? "🛣️ Route"
                        : p.type === "Batiment"
                          ? "🏢 Bâtiment"
                          : "🌉 Pont"}
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs line-clamp-3 h-12 bg-gray-50/50 p-2 rounded-lg border">
                    {p.description || "Aucune description technique."}
                  </p>
                  <div className="grid grid-cols-2 gap-y-2 pt-2 border-t text-xs">
                    <div>
                      <span className="text-gray-400 block font-medium">
                        Début
                      </span>
                      <span className="text-gray-700 font-semibold">
                        {formatDate(p.date_debut)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-medium">
                        Livraison
                      </span>
                      <span className="text-gray-700 font-semibold">
                        {formatDate(p.date_fin_prevue)}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-400 block font-medium">
                        Budget alloué
                      </span>
                      <span className="text-blue-600 font-bold text-sm">
                        {formatBudget(p.budget)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-5 py-3 border-t flex justify-end items-center gap-2 text-xs font-semibold bg-gray-50/50">
                  {!p.is_deleted ? (
                    <>
                      <button
                        onClick={() => {
                          setSelectedProjet(p);
                          setIsEditModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition"
                      >
                        ✏️ Modifier
                      </button>
                      <button
                        onClick={() => handleSoftDelete(p.id_projet)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition"
                      >
                        🗑️ Corbeille
                      </button>
                    </>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRestore(p.id_projet)}
                        className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg transition hover:bg-emerald-700 shadow-sm"
                      >
                        🔄 Restaurer
                      </button>
                      <button
                        onClick={() => handleSupprimerDefinitif(p.id_projet)}
                        className="bg-red-600 text-white px-3 py-1.5 rounded-lg transition hover:bg-red-700 shadow-sm"
                      >
                        🗑️ Supprimer
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modals applicatifs */}
        <AddProjetModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onProjectCreated={handleProjectCreated}
        />
        <EditProjetModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedProjet(null);
          }}
          projet={selectedProjet}
          onProjectUpdated={handleProjectUpdated}
        />

        {/* POPUP MODAL DE CONFIRMATION PERSONNALISÉ (Tailwind UI) */}
        {confirmModal.isOpen && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-md w-full overflow-hidden p-6 space-y-4 transform transition-all scale-100 animate-fade-in">
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-xl text-lg ${confirmModal.isDanger ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}
                >
                  {confirmModal.isDanger ? "⚠️" : "ℹ️"}
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    {confirmModal.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {confirmModal.message}
                  </p>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() =>
                    setConfirmModal((prev) => ({ ...prev, isOpen: false }))
                  }
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-xl transition"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={confirmModal.onConfirm}
                  className={`py-2 px-4 rounded-xl text-white shadow-md transition ${
                    confirmModal.isDanger
                      ? "bg-red-600 hover:bg-red-700 shadow-red-100"
                      : "bg-blue-600 hover:bg-blue-700 shadow-blue-100"
                  }`}
                >
                  Confirmer l'action
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjetsManager;
