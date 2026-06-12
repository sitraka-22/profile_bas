import React, { useState, useEffect } from "react";
import api from "../service/api";

interface Employe {
  id_employe: number;
  nom: string;
  prenom: string;
  telephone: string;
  poste: string;
  salaire_journalier: number;
  id_projet: number | null;
  nom_projet: string | null;
}

interface Projet {
  id_projet: number;
  nom_projet: string;
}

// Alignement strict avec l'ENUM PostgreSQL
const POSTES_ENUM = [
  { value: "Chef_Chantier", label: "Chef de Chantier" },
  { value: "Conducteur_Travaux", label: "Conducteur de Travaux" },
  { value: "Ingenieur", label: "Ingénieur" },
  { value: "Macon", label: "Maçon" },
  { value: "Chauffeur_Engin", label: "Chauffeur d'Engin" },
  { value: "Ouvrier", label: "Ouvrier" },
];

export default function EmployeFormBuilder() {
  // États de données
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [projets, setProjets] = useState<Projet[]>([]);

  // États de filtrage et recherche
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPoste, setSelectedPoste] = useState("");
  const [selectedProjet, setSelectedProjet] = useState("");
  const [currentTab, setCurrentTab] = useState<"tous" | "actifs" | "non_assignes">("tous");

  // État pour la gestion de la Modale d'ajout
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    poste: "Ouvrier", // Valeur par défaut parmi l'enum
    salaire_journalier: "",
    id_projet: "",
    id_utilisateur: null
  });

  // États d'affichage
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Chargement des données au démarrage et à chaque changement de filtre BDD
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
      setError("Erreur lors de la récupération des données de l'effectif.");
    } finally {
      setLoading(false);
    }
  };

  // Action : Soumettre le formulaire d'ajout
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        salaire_journalier: Number(formData.salaire_journalier),
        id_projet: formData.id_projet === "" ? null : Number(formData.id_projet)
      };

      const response = await api.post("/employes", payload);
      
      // Rafraîchir la liste et fermer le formulaire
      setEmployes([response.data, ...employes]);
      setIsModalOpen(false);
      
      // Réinitialiser le formulaire
      setFormData({
        nom: "",
        prenom: "",
        telephone: "",
        poste: "Ouvrier",
        salaire_journalier: "",
        id_projet: "",
        id_utilisateur: null
      });
      
      // Recharger l'ensemble des données pour recalculer les liaisons de projets
      fetchData();
    } catch (err: any) {
      alert("Erreur lors de l'ajout de l'employé : " + (err.response?.data?.error || err.message));
    }
  };

  // Action : Supprimer / Licencier un employé
  const handleTerminateContract = async (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir retirer cet employé des effectifs de COLASS ?")) {
      try {
        await api.delete(`/employes/${id}`);
        setEmployes(employes.filter((emp) => emp.id_employe !== id));
      } catch (err) {
        alert("Impossible de supprimer cet employé.");
      }
    }
  };

  // Filtrage combiné local (Recherche textuelle + Onglets)
  const filteredEmployes = employes.filter((emp) => {
    const matchesSearch =
      emp.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (emp.prenom && emp.prenom.toLowerCase().includes(searchQuery.toLowerCase())) ||
      emp.telephone.includes(searchQuery);

    if (currentTab === "actifs") {
      return matchesSearch && emp.id_projet !== null;
    }
    if (currentTab === "non_assignes") {
      return matchesSearch && emp.id_projet === null;
    }
    return matchesSearch;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans">
      {/* En-tête principal */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-[#1a365d] tracking-tight">
            Gestion du Personnel
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Suivi des affectations, postes et rémunérations journalières de la COLASS.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#1a365d] hover:bg-[#2b6cb0] text-white font-semibold px-5 py-2.5 rounded-xl shadow-md transition-all duration-200 flex items-center gap-2 cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Embaucher un employé
        </button>
      </div>

      {/* --- SOUS-MENU DE NAVIGATION (CONTAINER TABS) --- */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6" aria-label="Tabs">
          <button
            onClick={() => setCurrentTab("tous")}
            className={`pb-4 px-1 text-sm font-medium border-b-2 transition-all cursor-pointer ${
              currentTab === "tous"
                ? "border-[#1a365d] text-[#1a365d] font-bold"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Tous les employés ({employes.length})
          </button>
          <button
            onClick={() => setCurrentTab("actifs")}
            className={`pb-4 px-1 text-sm font-medium border-b-2 transition-all cursor-pointer ${
              currentTab === "actifs"
                ? "border-[#1a365d] text-[#1a365d] font-bold"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Assignés à un chantier
          </button>
          <button
            onClick={() => setCurrentTab("non_assignes")}
            className={`pb-4 px-1 text-sm font-medium border-b-2 transition-all cursor-pointer ${
              currentTab === "non_assignes"
                ? "border-[#1a365d] text-[#1a365d] font-bold"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            En attente d'affectation
          </button>
        </nav>
      </div>

      {/* Barre de Recherche et Filtres Sélecteurs */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Rechercher par nom, prénom ou téléphone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#2b6cb0] text-sm text-gray-800"
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Filtre Poste Corrigé avec les vraies valeurs ENUM */}
        <div className="w-full md:w-48">
          <select
            value={selectedPoste}
            onChange={(e) => setSelectedPoste(e.target.value)}
            className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#2b6cb0] text-sm text-gray-700"
          >
            <option value="">Tous les postes</option>
            {POSTES_ENUM.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

        {/* Filtre Chantier */}
        <div className="w-full md:w-56">
          <select
            value={selectedProjet}
            onChange={(e) => setSelectedProjet(e.target.value)}
            className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#2b6cb0] text-sm text-gray-700"
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

      {/* Zone Table / Résultats */}
      {error && <div className="p-4 bg-red-50 text-red-700 border border-red-100 rounded-xl mb-6 text-sm">{error}</div>}

      {loading ? (
        <div className="text-center py-12 text-gray-500 font-medium">Chargement des effectifs...</div>
      ) : filteredEmployes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-500">
          Aucun employé ne correspond à vos critères actuels.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-600 uppercase tracking-wider">
                  <th className="px-6 py-4">Nom complet</th>
                  <th className="px-6 py-4">Téléphone</th>
                  <th className="px-6 py-4">Poste occupé</th>
                  <th className="px-6 py-4">Chantier assigné</th>
                  <th className="px-6 py-4 text-right">Salaire Journalier</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {filteredEmployes.map((emp) => (
                  <tr key={emp.id_employe} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {emp.nom.toUpperCase()} {emp.prenom || ""}
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-mono text-xs">{emp.telephone}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                        {emp.poste.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {emp.id_projet ? (
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          <span className="font-medium text-gray-800">{emp.nom_projet}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md font-medium border border-amber-100">
                          Non assigné
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-bold font-mono text-gray-900">
                      {Number(emp.salaire_journalier).toLocaleString("fr-FR")} Ar
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button className="text-blue-600 hover:text-blue-800 p-1.5 hover:bg-blue-50 rounded-lg cursor-pointer">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                        </button>
                        <button onClick={() => handleTerminateContract(emp.id_employe)} className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg cursor-pointer">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-11V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- MODALE FORMULAIRE D'AJOUT --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            
            {/* Header Modale */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#1a365d] text-white rounded-t-2xl">
              <h2 className="text-xl font-bold tracking-tight">Formulaire d'Embauche</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white text-2xl font-bold focus:outline-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Corps du Formulaire */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Nom *</label>
                  <input
                    type="text"
                    required
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#2b6cb0] focus:outline-none"
                    placeholder="Ex: Ranaivo"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Prénom</label>
                  <input
                    type="text"
                    value={formData.prenom}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#2b6cb0] focus:outline-none"
                    placeholder="Ex: Jean"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Téléphone *</label>
                <input
                  type="text"
                  required
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:border-[#2b6cb0] focus:outline-none"
                  placeholder="Ex: 0340000000"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Poste (Type BDD) *</label>
                  <select
                    value={formData.poste}
                    onChange={(e) => setFormData({ ...formData, poste: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 bg-white rounded-lg text-sm focus:border-[#2b6cb0] focus:outline-none"
                  >
                    {POSTES_ENUM.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Salaire Journalier (Ar) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.salaire_journalier}
                    onChange={(e) => setFormData({ ...formData, salaire_journalier: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:border-[#2b6cb0] focus:outline-none"
                    placeholder="Ex: 75000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Assigner immédiatement à un Chantier</label>
                <select
                  value={formData.id_projet}
                  onChange={(e) => setFormData({ ...formData, id_projet: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 bg-white rounded-lg text-sm focus:border-[#2b6cb0] focus:outline-none"
                >
                  <option value="">-- Laisser en attente d'affectation --</option>
                  {projets.map((p) => (
                    <option key={p.id_projet} value={p.id_projet}>{p.nom_projet}</option>
                  ))}
                </select>
              </div>

              {/* Actions de la modale */}
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 rounded-lg bg-gray-100 hover:bg-gray-200 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-md transition-all cursor-pointer"
                >
                  Valider l'embauche
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}