import React, { useState, useEffect } from "react";
import api from "../service/api";

interface Employe {
  id_employe: number;
  nom: string;
  prenom: string;
  telephone: string;
  poste:
    | "Chef_Chantier"
    | "Conducteur_Travaux"
    | "Ingenieur"
    | "Macon"
    | "Chauffeur_Engin"
    | "Ouvrier";
  salaire_journalier: number;
  id_projet: number | null;
  nom_projet: string | null;
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

export default function EmployeFormBuilder() {
  // États de données
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [projets, setProjets] = useState<Projet[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // États de filtrage, recherche et sous-menus
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPoste, setSelectedPoste] = useState("");
  const [selectedProjet, setSelectedProjet] = useState("");

  // Onglets
  const [currentTab, setCurrentTab] = useState<
    "tous" | "actifs" | "non_assignes" | "corbeille"
  >("tous");

  // États de la boîte modale d'embauche
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [poste, setPoste] = useState<Employe["poste"]>("Ouvrier");
  const [salaire, setSalaire] = useState<number>(20000);
  const [projetEmbauche, setProjetEmbauche] = useState<string>("null");

  // États de la boîte modale de MODIFICATION
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmploye, setSelectedEmploye] = useState<Employe | null>(null);
  const [editNom, setEditNom] = useState("");
  const [editPrenom, setEditPrenom] = useState("");
  const [editTelephone, setEditTelephone] = useState("");
  const [editPoste, setEditPoste] = useState<Employe["poste"]>("Ouvrier");
  const [editSalaire, setEditSalaire] = useState<number>(20000);

  // États de pagination (Bloqué à 10 éléments par page)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // États d'affichage
  const [loading, setLoading] = useState(true);

  // Gestion des notifications (Toasts)
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

  // Réinitialisation de la page lors d'un changement de filtre ou d'onglet
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedPoste, selectedProjet, currentTab]);

  useEffect(() => {
    fetchData();
  }, [selectedPoste, selectedProjet]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let url = "/employes";
      const params = new URLSearchParams();
      if (selectedPoste) params.append("poste", selectedPoste);
      if (selectedProjet) params.append("id_projet", selectedProjet);
      if (params.toString()) url += `?${params.toString()}`;

      const [employesRes, projetsRes] = await Promise.all([
        api.get(url),
        api.get("/projets"),
      ]);

      setEmployes(employesRes.data);
      setProjets(projetsRes.data);
    } catch (err: any) {
      showToast(
        "Impossible de charger les employés depuis le serveur.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  // [POST] : Enregistrer un employé
  const handleCreateEmploye = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const id_projet =
        projetEmbauche === "null" ? null : parseInt(projetEmbauche, 10);

      const response = await api.post("/employes", {
        nom,
        prenom,
        telephone,
        poste,
        salaire_journalier: Number(salaire),
        id_projet,
        id_utilisateur: null,
      });

      if (response.status === 201 || response.status === 200) {
        const projetAssocie = projets.find((p) => p.id_projet === id_projet);
        const nouvelEmp: Employe = {
          ...response.data,
          nom_projet: projetAssocie ? projetAssocie.nom_projet : null,
          is_delete: false,
        };

        setEmployes((prev) => [nouvelEmp, ...prev]);
        setIsModalOpen(false);

        setNom("");
        setPrenom("");
        setTelephone("");
        setSalaire(20000);
        showToast(
          `L'employé ${nom.toUpperCase()} a été enregistré avec succès.`,
          "success",
        );
      }
    } catch (err: any) {
      showToast("Erreur lors de la création de la fiche employé.", "error");
    }
  };

  // Ouvrir la boîte modale d'édition et pré-remplir les données
  const openEditModal = (emp: Employe) => {
    setSelectedEmploye(emp);
    setEditNom(emp.nom);
    setEditPrenom(emp.prenom || "");
    setEditTelephone(emp.telephone);
    setEditPoste(emp.poste);
    setEditSalaire(emp.salaire_journalier);
    setIsEditModalOpen(true);
  };

  // [PUT / PATCH] : Valider la modification globale de l'employé
  const handleUpdateEmploye = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmploye) return;

    try {
      // Ajuste l'URL si ton backend attend /employes/:id
      const response = await api.put(
        `/employes/${selectedEmploye.id_employe}`,
        {
          nom: editNom,
          prenom: editPrenom,
          telephone: editTelephone,
          poste: editPoste,
          salaire_journalier: Number(editSalaire),
        },
      );

      if (response.status === 200) {
        setEmployes((prev) =>
          prev.map((emp) =>
            emp.id_employe === selectedEmploye.id_employe
              ? {
                  ...emp,
                  nom: editNom,
                  prenom: editPrenom,
                  telephone: editTelephone,
                  poste: editPoste,
                  salaire_journalier: Number(editSalaire),
                }
              : emp,
          ),
        );
        setIsEditModalOpen(false);
        showToast(
          `Fiche de ${editNom.toUpperCase()} mise à jour avec succès.`,
          "success",
        );
      }
    } catch (err: any) {
      showToast(
        "Erreur lors de la mise à jour des détails de l'employé.",
        "error",
      );
    }
  };

  // [PATCH] : Mutation de chantier rapide
  const handleMutation = async (
    id_employe: number,
    id_projet_selectionne: string,
  ) => {
    const id_projet =
      id_projet_selectionne === "null"
        ? null
        : parseInt(id_projet_selectionne, 10);

    try {
      const response = await api.patch(`/employes/${id_employe}/chantier`, {
        id_projet,
      });

      if (response.status === 200) {
        setEmployes((prevEmployes) =>
          prevEmployes.map((emp) => {
            if (emp.id_employe === id_employe) {
              const projetAssocie = projets.find(
                (p) => p.id_projet === id_projet,
              );
              return {
                ...emp,
                id_projet: id_projet,
                nom_projet: projetAssocie ? projetAssocie.nom_projet : null,
              };
            }
            return emp;
          }),
        );
        showToast(
          "Mutation et réaffectation du personnel enregistrées.",
          "success",
        );
      }
    } catch (err: any) {
      console.error("Erreur mutation:", err);
      showToast("Erreur lors du transfert de chantier.", "error");
    }
  };

  // [DELETE] : Soft Delete (Déplacer vers la corbeille)
  const handleSoftDelete = async (id: number, nomComplet: string) => {
    if (
      window.confirm(
        `Voulez-vous envoyer "${nomComplet.toUpperCase()}" dans la corbeille ?`,
      )
    ) {
      try {
        const response = await api.delete(`/employes/${id}`);
        if (response.status === 200) {
          setEmployes((prev) =>
            prev.map((emp) =>
              emp.id_employe === id ? { ...emp, is_delete: true } : emp,
            ),
          );
          showToast(
            `"${nomComplet.toUpperCase()}" déplacé dans la corbeille.`,
            "info",
          );
        }
      } catch (err) {
        showToast("Erreur lors de l'envoi à la corbeille.", "error");
      }
    }
  };

  // [PATCH] : Restaurer depuis la corbeille
  const handleRestore = async (id: number, nomComplet: string) => {
    try {
      const response = await api.patch(`/employes/${id}/restore`);
      if (response.status === 200) {
        setEmployes((prev) =>
          prev.map((emp) =>
            emp.id_employe === id ? { ...emp, is_delete: false } : emp,
          ),
        );
        showToast(
          `"${nomComplet.toUpperCase()}" a été restauré avec succès.`,
          "success",
        );
      }
    } catch (err) {
      showToast("Erreur lors de la restauration de l'employé.", "error");
    }
  };

  // [DELETE] : Hard Delete (Suppression définitive)
  const handleHardDelete = async (id: number, nomComplet: string) => {
    if (
      window.confirm(
        `⚠️ ATTENTION : Voulez-vous supprimer définitivement "${nomComplet.toUpperCase()}" ? Cette action est irréversible.`,
      )
    ) {
      try {
        const response = await api.delete(`/employes/${id}/permanent`);
        if (response.status === 200) {
          setEmployes((prev) => prev.filter((emp) => emp.id_employe !== id));
          showToast(
            `Fiche de "${nomComplet.toUpperCase()}" définitivement supprimée.`,
            "success",
          );
        }
      } catch (err) {
        showToast(
          "Impossible de supprimer définitivement cet employé.",
          "error",
        );
      }
    }
  };

  // Séparation du filtrage selon les onglets et la Corbeille
  const filteredEmployes = employes.filter((emp) => {
    const matchesSearch =
      emp.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (emp.prenom &&
        emp.prenom.toLowerCase().includes(searchQuery.toLowerCase())) ||
      emp.telephone.includes(searchQuery);

    if (currentTab === "corbeille") {
      return matchesSearch && emp.is_delete === true;
    } else {
      if (emp.is_delete === true) return false;
      if (currentTab === "actifs")
        return matchesSearch && emp.id_projet !== null;
      if (currentTab === "non_assignes")
        return matchesSearch && emp.id_projet === null;
      return matchesSearch;
    }
  });

  // Découpage Pagination (Strictement 10 par 10)
  const totalItems = filteredEmployes.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEmployes.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans relative">
      {/* ZONE POPUPS (TOASTS) */}
      <div className="fixed top-5 right-5 z-50 space-y-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-xl border text-sm font-semibold flex justify-between items-center transform transition-all duration-300 ${
              toast.type === "success"
                ? "bg-green-50 border-green-200 text-green-800 shadow-green-100/50"
                : toast.type === "error"
                  ? "bg-red-50 border-red-200 text-red-800 shadow-red-100/50"
                  : "bg-blue-50 border-blue-200 text-blue-800 shadow-blue-100/50"
            }`}
          >
            <span>{toast.message}</span>
            <button
              onClick={() =>
                setToasts((prev) => prev.filter((t) => t.id !== toast.id))
              }
              className="ml-4 text-gray-400 hover:text-gray-600 font-bold text-lg"
            >
              &times;
            </button>
          </div>
        ))}
      </div>

      {/* En-tête principal */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-[#1a365d] tracking-tight">
            Gestion du Personnel
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Suivi des affectations, mutations et modifications de l'effectif.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#1a365d] hover:bg-[#2b6cb0] text-white font-semibold px-5 py-2.5 rounded-xl shadow-md transition-all duration-200 flex items-center gap-2 cursor-pointer active:scale-95"
        >
          ➕ Embaucher un employé
        </button>
      </div>

      {/* Onglets */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6 flex-wrap">
          {[
            {
              id: "tous",
              label: `Tous (${employes.filter((e) => !e.is_delete).length})`,
            },
            { id: "actifs", label: "Assignés à un chantier" },
            { id: "non_assignes", label: "En attente d'affectation" },
            {
              id: "corbeille",
              label: `🗑️ Corbeille (${employes.filter((e) => e.is_delete).length})`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id as any)}
              className={`pb-4 px-1 text-sm font-medium border-b-2 transition-all cursor-pointer ${
                currentTab === tab.id
                  ? currentTab === "corbeille"
                    ? "border-red-500 text-red-600 font-bold"
                    : "border-[#1a365d] text-[#1a365d] font-bold"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Filtres de Recherche */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Rechercher par nom, prénom ou téléphone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#2b6cb0] text-sm text-gray-800 focus:ring-2 focus:ring-blue-100 transition-all"
          />
          <span className="absolute left-3 top-3 text-gray-400">🔍</span>
        </div>

        <div className="w-full md:w-48">
          <select
            value={selectedPoste}
            onChange={(e) => setSelectedPoste(e.target.value)}
            className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none"
          >
            <option value="">Tous les postes</option>
            <option value="Chef_Chantier">Chef de Chantier</option>
            <option value="Conducteur_Travaux">Conducteur de Travaux</option>
            <option value="Ingenieur">Ingénieur</option>
            <option value="Macon">Maçon</option>
            <option value="Chauffeur_Engin">Chauffeur d'Engin</option>
            <option value="Ouvrier">Ouvrier</option>
          </select>
        </div>

        <div className="w-full md:w-56">
          <select
            value={selectedProjet}
            onChange={(e) => setSelectedProjet(e.target.value)}
            className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none"
          >
            <option value="">Tous les chantiers</option>
            {projets.map((p) => (
              <option key={p.id_projet} value={p.id_projet}>
                {p.nom_projet}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tableau d'affichage */}
      {loading ? (
        <div className="text-center py-12 text-gray-500 font-medium">
          Chargement des effectifs...
        </div>
      ) : currentItems.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-500">
          Aucun employé trouvé dans cette catégorie.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-600 uppercase tracking-wider">
                  <th className="px-6 py-4">Nom complet</th>
                  <th className="px-6 py-4">Téléphone</th>
                  <th className="px-6 py-4">Poste</th>
                  <th className="px-6 py-4">
                    {currentTab === "corbeille" ? "Statut" : "Chantier Actuel"}
                  </th>
                  <th className="px-6 py-4 text-right">Salaire Journalier</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {currentItems.map((emp) => (
                  <tr
                    key={emp.id_employe}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {emp.nom.toUpperCase()} {emp.prenom || ""}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-600">
                      {emp.telephone}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                        {emp.poste.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {currentTab === "corbeille" ? (
                        <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded font-medium">
                          Masqué (Corbeille)
                        </span>
                      ) : (
                        <select
                          value={emp.id_projet || "null"}
                          onChange={(e) =>
                            handleMutation(emp.id_employe, e.target.value)
                          }
                          className="text-sm px-2 py-1 border border-gray-300 rounded bg-white focus:outline-none"
                        >
                          <option value="null">📦 Aucun chantier</option>
                          {projets.map((p) => (
                            <option key={p.id_projet} value={p.id_projet}>
                              🏗️ {p.nom_projet}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-bold font-mono text-gray-900">
                      {Number(emp.salaire_journalier).toLocaleString("fr-FR")}{" "}
                      Ar
                    </td>
                    <td className="px-6 py-4 text-center">
                      {currentTab === "corbeille" ? (
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() =>
                              handleRestore(
                                emp.id_employe,
                                `${emp.nom} ${emp.prenom}`,
                              )
                            }
                            className="text-green-600 hover:text-green-800 font-bold text-xs bg-green-50 px-2 py-1 rounded transition"
                          >
                            Restaurer
                          </button>
                          <button
                            onClick={() =>
                              handleHardDelete(
                                emp.id_employe,
                                `${emp.nom} ${emp.prenom}`,
                              )
                            }
                            className="text-red-600 hover:text-red-900 font-bold text-xs bg-red-50 px-2 py-1 rounded transition"
                          >
                            Supprimer
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-center gap-2">
                          {/* BOUTON ÉDITER GLOBAL (AJOUTÉ) */}
                          <button
                            onClick={() => openEditModal(emp)}
                            title="Modifier les détails de la fiche"
                            className="text-blue-600 hover:text-blue-800 p-1.5 hover:bg-blue-50 rounded-lg transition"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() =>
                              handleSoftDelete(
                                emp.id_employe,
                                `${emp.nom} ${emp.prenom}`,
                              )
                            }
                            title="Mettre à la corbeille"
                            className="text-amber-500 hover:text-amber-700 p-1.5 hover:bg-amber-50 rounded-lg transition"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pied de Page avec Pagination 10 par 10 */}
          <div className="bg-gray-50/70 border-t border-gray-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-gray-500 font-medium">
              Affichage de{" "}
              <span className="font-bold text-gray-800">
                {indexOfFirstItem + 1}
              </span>{" "}
              à{" "}
              <span className="font-bold text-gray-800">
                {Math.min(indexOfLastItem, totalItems)}
              </span>{" "}
              sur <span className="font-bold text-gray-800">{totalItems}</span>{" "}
              employés
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${currentPage === 1 ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
                >
                  ◀ Précédent
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold ${currentPage === i + 1 ? "bg-[#1a365d] text-white" : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${currentPage === totalPages ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
                >
                  Suivant ▶
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODALE 1 : EMBAUCHER UN EMPLOYÉ */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-[#1a365d]">
                Fiche de Recrutement
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleCreateEmploye} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className="w-full text-sm px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    className="w-full text-sm px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Téléphone *
                </label>
                <input
                  type="text"
                  placeholder="Ex: 0340000000"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  className="w-full text-sm px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Poste *
                  </label>
                  <select
                    value={poste}
                    onChange={(e) => setPoste(e.target.value as any)}
                    className="w-full text-sm px-3 py-2 border rounded-lg bg-white"
                  >
                    <option value="Chef_Chantier">Chef de Chantier</option>
                    <option value="Conducteur_Travaux">
                      Conducteur de Travaux
                    </option>
                    <option value="Ingenieur">Ingénieur</option>
                    <option value="Macon">Maçon</option>
                    <option value="Chauffeur_Engin">Chauffeur d'Engin</option>
                    <option value="Ouvrier">Ouvrier</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Salaire Journalier (Ar) *
                  </label>
                  <input
                    type="number"
                    min="5000"
                    value={salaire}
                    onChange={(e) =>
                      setSalaire(parseInt(e.target.value, 10) || 0)
                    }
                    className="w-full text-sm px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Affectation de départ
                </label>
                <select
                  value={projetEmbauche}
                  onChange={(e) => setProjetEmbauche(e.target.value)}
                  className="w-full text-sm px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="null">En Stock (Non affecté)</option>
                  {projets.map((p) => (
                    <option key={p.id_projet} value={p.id_projet}>
                      🏗️ {p.nom_projet}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-100 text-gray-700 text-sm py-2 px-4 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-[#1a365d] text-white text-sm py-2 px-4 rounded-lg shadow"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE 2 : MODIFIER UN EMPLOYÉ SÉLECTIONNÉ (NOUVEAU) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-blue-900">
                Mettre à jour la fiche employé
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleUpdateEmploye} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={editNom}
                    onChange={(e) => setEditNom(e.target.value)}
                    className="w-full text-sm px-3 py-2 border rounded-lg focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={editPrenom}
                    onChange={(e) => setEditPrenom(e.target.value)}
                    className="w-full text-sm px-3 py-2 border rounded-lg focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Téléphone *
                </label>
                <input
                  type="text"
                  value={editTelephone}
                  onChange={(e) => setEditTelephone(e.target.value)}
                  className="w-full text-sm px-3 py-2 border rounded-lg focus:border-blue-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Poste occupé *
                  </label>
                  <select
                    value={editPoste}
                    onChange={(e) => setEditPoste(e.target.value as any)}
                    className="w-full text-sm px-3 py-2 border rounded-lg bg-white focus:border-blue-500"
                  >
                    <option value="Chef_Chantier">Chef de Chantier</option>
                    <option value="Conducteur_Travaux">
                      Conducteur de Travaux
                    </option>
                    <option value="Ingenieur">Ingénieur</option>
                    <option value="Macon">Maçon</option>
                    <option value="Chauffeur_Engin">Chauffeur d'Engin</option>
                    <option value="Ouvrier">Ouvrier</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Salaire Journalier (Ar) *
                  </label>
                  <input
                    type="number"
                    min="5000"
                    value={editSalaire}
                    onChange={(e) =>
                      setEditSalaire(parseInt(e.target.value, 10) || 0)
                    }
                    className="w-full text-sm px-3 py-2 border rounded-lg focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="bg-gray-100 text-gray-700 text-sm py-2 px-4 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white text-sm py-2 px-4 rounded-lg shadow hover:bg-blue-700"
                >
                  Appliquer les modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
