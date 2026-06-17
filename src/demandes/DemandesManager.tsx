import React, { useState, useEffect } from "react";
import api from "../service/api";
import AddDemandeModal from "./AddDemandeModal";
import EditDemandeModal from "./EditDemandeModal";

interface Demande {
  id_demande: number;
  titre_demande: string;
  description: string;
  staut: "En_attente" | "Approuve" | "Refuse";
  id_projet: number;
  nom_projet: string;
  id_employe?: number;
  nom_employe: string;
  email_demandeur: string;
  create_at: string;
  delete_at?: string;
}

interface Toast {
  id: number;
  type: "success" | "error" | "info";
  message: string;
}

interface ConfirmationModal {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  confirmColor: string;
}

const DemandesManager: React.FC = () => {
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [corbeille, setCorbeille] = useState<Demande[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Modals de formulaires
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDemande, setSelectedDemande] = useState<Demande | null>(null);

  // Modal de confirmation customisé (Popup à la place de window.confirm)
  const [confirmModal, setConfirmModal] = useState<ConfirmationModal>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    confirmColor: "bg-blue-600 hover:bg-blue-700",
  });

  // Modal d'affichage de l'histogramme
  const [showChartModal, setShowChartModal] = useState(false);

  const [currentTab, setCurrentTab] = useState<string>("Tous");
  const [showCorbeille, setShowCorbeille] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination (10 par 10)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "success",
  ) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      4000,
    );
  };

  const fetchDemandes = async () => {
    try {
      const response = await api.get("/demandes");
      setDemandes(response.data);
    } catch (error) {
      showToast("Erreur lors du chargement des demandes actives.", "error");
    }
  };

  const fetchCorbeille = async () => {
    try {
      const response = await api.get("/demandes/corbeille");
      setCorbeille(response.data);
    } catch (error) {
      showToast("Erreur lors du chargement de la corbeille.", "error");
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    if (showCorbeille) {
      fetchCorbeille();
    } else {
      fetchDemandes();
    }
  }, [showCorbeille, currentTab, searchTerm]);

  // Déclencheur du popup de confirmation
  const triggerConfirmation = (
    title: string,
    message: string,
    onConfirm: () => void,
    confirmColor: string = "bg-blue-600 hover:bg-blue-700",
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
      confirmColor,
    });
  };

  const handleTraitement = (id: number, statut: "Approuve" | "Refuse") => {
    const label = statut === "Approuve" ? "APPROUVER" : "REFUSER";
    const color =
      statut === "Approuve"
        ? "bg-emerald-600 hover:bg-emerald-700"
        : "bg-red-600 hover:bg-red-700";

    triggerConfirmation(
      `Gestion Statut : ${label}`,
      `Êtes-vous sûr de vouloir passer cette demande logistique au statut "${statut}" ?`,
      async () => {
        try {
          const response = await api.patch(`/demandes/${id}`, { statut });
          if (response.status === 200) {
            setDemandes((prev) =>
              prev.map((d) =>
                d.id_demande === id ? { ...d, staut: statut } : d,
              ),
            );
            showToast(`Statut mis à jour avec succès : ${statut}.`, "success");
          }
        } catch (error) {
          showToast(
            "Impossible d'appliquer le statut. Veuillez vérifier la connexion.",
            "error",
          );
        }
      },
      color,
    );
  };

  const handleDelete = (id: number) => {
    triggerConfirmation(
      "Mettre à la corbeille",
      "Voulez-vous déplacer cette fiche de demande dans la corbeille COLASS ?",
      async () => {
        try {
          await api.delete(`/demandes/${id}`);
          setDemandes((prev) => prev.filter((d) => d.id_demande !== id));
          showToast("Demande envoyée à la corbeille.", "info");
        } catch (error) {
          showToast("Erreur lors de la suppression temporaire.", "error");
        }
      },
      "bg-amber-600 hover:bg-amber-700",
    );
  };

  const handleRestaurer = (id: number) => {
    triggerConfirmation(
      "Restaurer l'élément",
      "Réintégrer cette demande dans le flux des flux logistiques actifs ?",
      async () => {
        try {
          await api.patch(`/demandes/${id}/restaurer`);
          setCorbeille((prev) => prev.filter((d) => d.id_demande !== id));
          showToast("Demande restaurée avec succès.", "success");
        } catch (error) {
          showToast("Impossible de restaurer l'élément.", "error");
        }
      },
      "bg-blue-600 hover:bg-blue-700",
    );
  };

  const handleDeleteDefinitif = (id: number) => {
    triggerConfirmation(
      "⚠️ Suppression définitive",
      "Cette action est irréversible. Effacer définitivement cette fiche des registres ?",
      async () => {
        try {
          await api.delete(`/demandes/${id}/definitif`);
          setCorbeille((prev) => prev.filter((d) => d.id_demande !== id));
          showToast("Fiche détruite définitivement.", "success");
        } catch (error) {
          showToast("Erreur lors de la suppression définitive.", "error");
        }
      },
      "bg-red-600 hover:bg-red-700",
    );
  };

  const openEditModal = (demande: Demande) => {
    setSelectedDemande(demande);
    setIsEditModalOpen(true);
  };

  // Logique de génération du rapport imprimable (PDF)
  const generatePDFReport = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow)
      return showToast(
        "Veuillez autoriser les popups pour générer le PDF.",
        "error",
      );

    const htmlContent = `
      <html>
      <head>
        <title>Rapport - COLASS Logistique</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; margin: 40px; }
          .header { border-bottom: 3px solid #1e3a8a; padding-bottom: 15px; margin-bottom: 30px; }
          .title { font-size: 24px; font-weight: bold; color: #1e3a8a; text-transform: uppercase; }
          .subtitle { font-size: 12px; color: #666; margin-top: 5px; }
          table { w_idth: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
          th { background-color: #f3f4f6; color: #111827; text-align: left; padding: 10px; font-weight: bold; border-bottom: 2px solid #e5e7eb; }
          td { padding: 10px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
          .badge { display: inline-block; padding: 3px 8px; border-radius: 12px; font-weight: bold; font-size: 10px; }
          .badge-Approuve { background-color: #d1fae5; color: #065f46; }
          .badge-Refuse { background-color: #fee2e2; color: #991b1b; }
          .badge-En_attente { background-color: #fef3c7; color: #92400e; }
          .footer { margin-top: 40px; font-size: 10px; color: #9ca3af; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">COLASS S.A. — Registre des Demandes</div>
          <div class="subtitle">Généré le ${new Date().toLocaleString("fr-FR")} | Total fiches : ${listeAffichee.length}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Titre & Description</th>
              <th>Chantier / Projet</th>
              <th>Responsable</th>
              <th>Émetteur</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            ${listeAffichee
              .map(
                (d) => `
              <tr>
                <td>#${d.id_demande}</td>
                <td><strong>${d.titre_demande}</strong><br/><span style="color:#666">${d.description || "—"}</span></td>
                <td>${d.nom_projet}</td>
                <td>${d.nom_employe}</td>
                <td>${d.email_demandeur}</td>
                <td><span class="badge badge-${d.staut}">${d.staut.replace("_", " ")}</span></td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
        <div class="footer">Direction des infrastructures de Chantier COLASS - Rapport confidentiel d'administration interne.</div>
        <script>window.print();</script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    showToast("Aperçu avant impression lancé.", "info");
  };

  // Filtrage local
  const demandesFiltrees = demandes.filter((d) => {
    const matchTab = currentTab === "Tous" ? true : d.staut === currentTab;
    const search = searchTerm.toLowerCase().trim();
    return (
      matchTab &&
      (search === ""
        ? true
        : d.titre_demande?.toLowerCase().includes(search) ||
          d.description?.toLowerCase().includes(search) ||
          d.nom_projet?.toLowerCase().includes(search) ||
          d.nom_employe?.toLowerCase().includes(search) ||
          d.email_demandeur?.toLowerCase().includes(search))
    );
  });

  const listeAffichee = showCorbeille ? corbeille : demandesFiltrees;

  // Statistiques pour l'histogramme SVG
  const countByStatut = {
    En_attente: demandes.filter((d) => d.staut === "En_attente").length,
    Approuve: demandes.filter((d) => d.staut === "Approuve").length,
    Refuse: demandes.filter((d) => d.staut === "Refuse").length,
  };
  const maxCount = Math.max(
    countByStatut.En_attente,
    countByStatut.Approuve,
    countByStatut.Refuse,
    1,
  );

  // Calculs pagination
  const totalItems = listeAffichee.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = listeAffichee.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans relative">
      {/* 🔔 Notifications Popups (Toasts) */}
      <div className="fixed top-5 right-5 z-50 space-y-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-xl text-xs font-semibold border flex justify-between items-center transition-all transform translate-y-0 animate-fade-in ${
              t.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : t.type === "error"
                  ? "bg-red-50 border-red-200 text-red-800"
                  : "bg-blue-50 border-blue-200 text-blue-800"
            }`}
          >
            <span>{t.message}</span>
            <button
              onClick={() =>
                setToasts((prev) => prev.filter((item) => item.id !== t.id))
              }
              className="ml-4 font-bold text-base hover:opacity-70"
            >
              &times;
            </button>
          </div>
        ))}
      </div>

      {/* ❓ POPUP DE CONFIRMATION CUSTOMISE (Remplaçant de window.confirm) */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-md w-full p-6 space-y-4 scale-100 transition-transform">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              {confirmModal.title}
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              {confirmModal.message}
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() =>
                  setConfirmModal((prev) => ({ ...prev, isOpen: false }))
                }
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className={`px-4 py-2 text-white rounded-xl text-xs font-semibold shadow-md ${confirmModal.confirmColor}`}
              >
                Confirmer l'action
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📊 POPUP MODAL HISTOGRAMME SVG */}
      {showChartModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-lg w-full p-6 space-y-6">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Histogramme analytique des statuts
                </h3>
                <p className="text-[11px] text-gray-400">
                  Totalisation en temps réel des fiches de demandes
                </p>
              </div>
              <button
                onClick={() => setShowChartModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-xl"
              >
                &times;
              </button>
            </div>

            {/* Dessin SVG de l'histogramme */}
            <div className="flex justify-center py-4 bg-gray-50/50 rounded-xl border border-dashed">
              <svg width="340" height="200" className="overflow-visible">
                {/* Lignes de guide horizontales */}
                <line
                  x1="40"
                  y1="30"
                  x2="320"
                  y2="30"
                  stroke="#f0f0f0"
                  strokeWidth="1"
                />
                <line
                  x1="40"
                  y1="90"
                  x2="320"
                  y2="90"
                  stroke="#f0f0f0"
                  strokeWidth="1"
                />
                <line
                  x1="40"
                  y1="150"
                  x2="320"
                  y2="150"
                  stroke="#f0f0f0"
                  strokeWidth="1"
                  strokeDasharray="4"
                />

                {/* Barre 1 : En attente */}
                <rect
                  x="65"
                  y={150 - (countByStatut.En_attente / maxCount) * 110}
                  width="45"
                  height={(countByStatut.En_attente / maxCount) * 110}
                  fill="#f59e0b"
                  rx="6"
                  className="transition-all duration-500"
                />
                <text
                  x="87.5"
                  y={140 - (countByStatut.En_attente / maxCount) * 110}
                  textAnchor="middle"
                  className="text-[10px] font-bold fill-amber-700"
                >
                  {countByStatut.En_attente}
                </text>
                <text
                  x="87.5"
                  y="170"
                  textAnchor="middle"
                  className="text-[10px] font-semibold fill-gray-500"
                >
                  En attente
                </text>

                {/* Barre 2 : Approuvé */}
                <rect
                  x="150"
                  y={150 - (countByStatut.Approuve / maxCount) * 110}
                  width="45"
                  height={(countByStatut.Approuve / maxCount) * 110}
                  fill="#10b981"
                  rx="6"
                  className="transition-all duration-500"
                />
                <text
                  x="172.5"
                  y={140 - (countByStatut.Approuve / maxCount) * 110}
                  textAnchor="middle"
                  className="text-[10px] font-bold fill-emerald-700"
                >
                  {countByStatut.Approuve}
                </text>
                <text
                  x="172.5"
                  y="170"
                  textAnchor="middle"
                  className="text-[10px] font-semibold fill-gray-500"
                >
                  Validées
                </text>

                {/* Barre 3 : Refusé */}
                <rect
                  x="235"
                  y={150 - (countByStatut.Refuse / maxCount) * 110}
                  width="45"
                  height={(countByStatut.Refuse / maxCount) * 110}
                  fill="#ef4444"
                  rx="6"
                  className="transition-all duration-500"
                />
                <text
                  x="257.5"
                  y={140 - (countByStatut.Refuse / maxCount) * 110}
                  textAnchor="middle"
                  className="text-[10px] font-bold fill-red-700"
                >
                  {countByStatut.Refuse}
                </text>
                <text
                  x="257.5"
                  y="170"
                  textAnchor="middle"
                  className="text-[10px] font-semibold fill-gray-500"
                >
                  Rejetées
                </text>

                {/* Ligne d'axe de base */}
                <line
                  x1="40"
                  y1="150"
                  x2="320"
                  y2="150"
                  stroke="#e5e7eb"
                  strokeWidth="2"
                />
              </svg>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowChartModal(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-xs font-semibold transition"
              >
                Fermer l'analyse
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🗂️ Container Principal */}
      <div className="max-w-6xl mx-auto space-y-6">
        {/* En-tête de page */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4 gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              Flux des Demandes Logistiques
            </h1>
            <p className="text-xs text-gray-500">
              Validation des flux de ressources et consommables par la direction
              COLASS.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowChartModal(true)}
              className="bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 font-semibold text-xs py-2 px-3 rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              📊 Histogramme
            </button>
            <button
              onClick={generatePDFReport}
              className="bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 font-semibold text-xs py-2 px-3 rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              🖨️ Générer Rapport PDF
            </button>
            <button
              onClick={() => setShowCorbeille((v) => !v)}
              className={`inline-flex items-center justify-center font-semibold text-xs py-2 px-4 rounded-xl shadow-xs transition ${
                showCorbeille
                  ? "bg-gray-800 text-white"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              🗑️ {showCorbeille ? "Revenir aux demandes" : "Poubelle"}
            </button>
            {!showCorbeille && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2 px-4 rounded-xl shadow-md transition"
              >
                ➕ Émettre une demande
              </button>
            )}
          </div>
        </div>

        {/* Barre de Recherche et Filtres par Onglet */}
        {!showCorbeille && (
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="🔍 Rechercher dans les demandes..."
              className="w-full max-w-xs text-xs py-2.5 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
            />
            <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
              {["Tous", "En_attente", "Approuve", "Refuse"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setCurrentTab(tab)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    currentTab === tab
                      ? "bg-white text-blue-600 shadow-xs"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {tab === "Tous"
                    ? "📁 Toutes"
                    : tab === "En_attente"
                      ? "⏳ En attente"
                      : tab === "Approuve"
                        ? "✅ Validées"
                        : "❌ Rejetées"}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 📋 Table d'affichage principale */}
        <div className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-wider font-bold border-b border-gray-200">
                  <th className="py-3.5 px-6">Détails de la Demande</th>
                  <th className="py-3.5 px-6">Chantier & Émetteur</th>
                  <th className="py-3.5 px-6">
                    {showCorbeille ? "Supprimée le" : "Statut Actuel"}
                  </th>
                  <th className="py-3.5 px-6 text-center">
                    Actions de Contrôle
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-xs text-gray-600">
                {currentItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-12 text-gray-400 italic"
                    >
                      Aucune fiche de demande enregistrée.
                    </td>
                  </tr>
                ) : (
                  currentItems.map((d) => (
                    <tr
                      key={d.id_demande}
                      className="hover:bg-gray-50/50 transition"
                    >
                      <td className="py-4 px-6 space-y-1 max-w-xs">
                        <div className="font-bold text-gray-900 text-sm">
                          {d.titre_demande}
                        </div>
                        <p className="text-gray-400 line-clamp-2">
                          {d.description || "Aucun détail fourni."}
                        </p>
                        <span className="text-[10px] text-gray-400 block font-light">
                          Demandeur : {d.email_demandeur}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-gray-800">
                          🏗️ {d.nom_projet}
                        </div>
                        <div className="text-gray-400 text-[11px]">
                          Resp : {d.nom_employe}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {showCorbeille ? (
                          <span>
                            {d.delete_at
                              ? new Date(d.delete_at).toLocaleString("fr-FR")
                              : "—"}
                          </span>
                        ) : (
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              d.staut === "Approuve"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : d.staut === "Refuse"
                                  ? "bg-red-50 text-red-700 border border-red-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200 animate-pulse"
                            }`}
                          >
                            {d.staut === "Approuve"
                              ? "● Validée"
                              : d.staut === "Refuse"
                                ? "● Refusée"
                                : "● En attente"}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center space-x-1.5 whitespace-nowrap">
                        {showCorbeille ? (
                          <div className="flex justify-center gap-1.5">
                            <button
                              onClick={() => handleRestaurer(d.id_demande)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition text-xs font-semibold shadow-xs"
                            >
                              ♻️ Restaurer
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteDefinitif(d.id_demande)
                              }
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg transition text-xs font-semibold shadow-xs"
                            >
                              Supprimer définitivement
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1">
                            <div className="flex gap-1 bg-gray-50 p-1 rounded-xl border border-gray-200 mr-2">
                              <button
                                onClick={() =>
                                  handleTraitement(d.id_demande, "Approuve")
                                }
                                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                                  d.staut === "Approuve"
                                    ? "bg-emerald-600 text-white shadow-xs"
                                    : "text-gray-500 hover:text-emerald-600 hover:bg-white"
                                }`}
                              >
                                Approuver
                              </button>
                              <button
                                onClick={() =>
                                  handleTraitement(d.id_demande, "Refuse")
                                }
                                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                                  d.staut === "Refuse"
                                    ? "bg-red-600 text-white shadow-xs"
                                    : "text-gray-500 hover:text-red-600 hover:bg-white"
                                }`}
                              >
                                Refuser
                              </button>
                            </div>

                            <button
                              onClick={() => openEditModal(d)}
                              title="Modifier la demande"
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition border border-transparent hover:border-blue-100"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDelete(d.id_demande)}
                              title="Mettre à la corbeille"
                              className="p-2 text-amber-600 hover:bg-amber-50 rounded-xl transition border border-transparent hover:border-amber-100"
                            >
                              🗑️
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 📑 PAGINATION PREMIUM DESIGN */}
          <div className="bg-gray-50/80 border-t border-gray-200 px-6 py-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="text-[11px] text-gray-500">
              Affichage de{" "}
              <span className="font-bold text-gray-700">
                {totalItems === 0 ? 0 : indexOfFirstItem + 1}
              </span>{" "}
              à{" "}
              <span className="font-bold text-gray-700">
                {Math.min(indexOfLastItem, totalItems)}
              </span>{" "}
              sur <span className="font-bold text-gray-700">{totalItems}</span>{" "}
              fiches logistiques
            </div>

            {totalPages > 1 && (
              <div className="flex gap-1 items-center">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition shadow-2xs"
                >
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 text-xs font-bold rounded-xl transition shadow-2xs ${
                      currentPage === i + 1
                        ? "bg-blue-600 text-white border border-blue-600"
                        : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition shadow-2xs"
                >
                  ›
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modals tierces intégrées */}
        <AddDemandeModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onDemandeCreated={fetchDemandes}
        />
        <EditDemandeModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedDemande(null);
          }}
          demande={selectedDemande}
          onDemandeUpdated={fetchDemandes}
        />
      </div>
    </div>
  );
};

export default DemandesManager;
