import React, { useState, useEffect } from "react";
import api from "../service/api";

// ============================================
// TYPES - Correspondance exacte avec la BDD
// ============================================
interface Employe {
  id_employe: number;
  nom: string;
  prenom: string;
  telephone: string;
  poste: 'Chef_Chantier' | 'Conducteur_Travaux' | 'Ingenieur' | 'Macon' | 'Chauffeur_Engin' | 'Ouvrier';
  salaire_journalier: number;
  id_projet: number | null;
  id_utilisateur: number | null;
  nom_projet: string | null;
  create_at?: string;
}

interface Projet {
  id_projet: number;
  nom_projet: string;
  description?: string;
  type?: 'Route' | 'Batiment' | 'Pont';
  status?: 'Etude' | 'En Cours' | 'Suspendu';
}

interface Utilisateur {
  id: number;
  email: string;
}

export default function EmployeFormBuilder() {
  // ============================================
  // ÉTATS EXISTANTS
  // ============================================
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [projets, setProjets] = useState<Projet[]>([]);
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPoste, setSelectedPoste] = useState("");
  const [selectedProjet, setSelectedProjet] = useState("");
  const [currentTab, setCurrentTab] = useState<"tous" | "actifs" | "non_assignes">("tous");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================
  // NOUVEAUX ÉTATS POUR LE MODAL D'EMBAUCHE
  // ============================================
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEmploye, setNewEmploye] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    poste: '',
    salaire_journalier: '',
    id_projet: '',
    id_utilisateur: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // ============================================
  // CHARGEMENT DES DONNÉES
  // ============================================
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

      const [employesRes, projetsRes, utilisateursRes] = await Promise.all([
        api.get(url),
        api.get("/projets"),
        api.get("/utilisateurs")
      ]);

      setEmployes(employesRes.data);
      setProjets(projetsRes.data);
      setUtilisateurs(utilisateursRes.data || []);
    } catch (err: any) {
      setError("Erreur lors de la récupération des données de l'effectif.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // FONCTIONS EXISTANTES
  // ============================================
  const handleTerminateContract = async (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir retirer cet employé des effectifs de COLASS ?")) {
      try {
        await api.delete(`/employes/${id}`);
        setEmployes(employes.filter((emp) => emp.id_employe !== id));
        alert("✅ Employé supprimé avec succès");
      } catch (err) {
        alert("Impossible de supprimer cet employé.");
      }
    }
  };

  // ============================================
  // NOUVELLES FONCTIONS POUR L'EMBAUCHE
  // ============================================
  const openModal = () => {
    setNewEmploye({
      nom: '',
      prenom: '',
      telephone: '',
      poste: '',
      salaire_journalier: '',
      id_projet: '',
      id_utilisateur: ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormError('');
  };

  // Empêcher le scroll du body quand le modal est ouvert
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewEmploye(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ============================================
  // SOUMISSION DU FORMULAIRE
  // ============================================
  const handleSubmitEmploye = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');

    if (!newEmploye.nom || !newEmploye.prenom || !newEmploye.telephone || 
        !newEmploye.poste || !newEmploye.salaire_journalier || !newEmploye.id_projet) {
      setFormError('Veuillez remplir tous les champs obligatoires');
      setSubmitting(false);
      return;
    }

    try {
      const dataToSend = {
        nom: newEmploye.nom.trim(),
        prenom: newEmploye.prenom.trim(),
        telephone: newEmploye.telephone.trim(),
        poste: newEmploye.poste,
        salaire_journalier: parseFloat(newEmploye.salaire_journalier),
        id_projet: parseInt(newEmploye.id_projet),
        id_utilisateur: newEmploye.id_utilisateur ? parseInt(newEmploye.id_utilisateur) : null
      };

      const response = await api.post('/employes', dataToSend);
      
      const newEmp = {
        ...response.data,
        nom_projet: projets.find(p => p.id_projet === parseInt(newEmploye.id_projet))?.nom_projet || null
      };
      setEmployes(prev => [newEmp, ...prev]);
      
      closeModal();
      alert(`✅ ${response.data.prenom} ${response.data.nom} a été embauché avec succès !`);
      
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Erreur lors de l\'embauche.');
      console.error('Erreur embauche:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================
  // FILTRAGE
  // ============================================
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

  // ============================================
  // RENDU
  // ============================================
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
          onClick={openModal}
          className="bg-[#1a365d] hover:bg-[#2b6cb0] text-white font-semibold px-5 py-2.5 rounded-xl shadow-md transition-all duration-200 flex items-center gap-2 cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Embaucher un employé
        </button>
      </div>

      {/* Sous-menu de navigation */}
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

      {/* Barre de Recherche et Filtres */}
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

        <div className="w-full md:w-48">
          <select
            value={selectedPoste}
            onChange={(e) => setSelectedPoste(e.target.value)}
            className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#2b6cb0] text-sm text-gray-700"
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

      {/* Affichage des erreurs */}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-100 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Tableau des employés */}
      {loading ? (
        <div className="text-center py-12 text-gray-500 font-medium">
          Chargement des effectifs de l'entreprise...
        </div>
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
                    <td className="px-6 py-4 text-gray-600 font-mono text-xs">
                      {emp.telephone}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                        {emp.poste.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {emp.id_projet ? (
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          <span className="font-medium text-gray-800">
                            {emp.nom_projet}
                          </span>
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
                        <button
                          title="Changement de chantier"
                          className="text-blue-600 hover:text-blue-800 transition-colors p-1.5 hover:bg-blue-50 rounded-lg cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleTerminateContract(emp.id_employe)}
                          title="Résilier le contrat"
                          className="text-red-500 hover:text-red-700 transition-colors p-1.5 hover:bg-red-50 rounded-lg cursor-pointer"
                        >
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

      {/* ============================================
          MODAL D'EMBAUCHE (SANS DEPENDANCE EXTERNE)
          ============================================ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={closeModal}
          />
          
          {/* Conteneur du modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-[#1a365d] flex items-center gap-3">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Embaucher un nouvel employé
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Formulaire */}
              <form onSubmit={handleSubmitEmploye}>
                {formError && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nom */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Nom <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="nom"
                      value={newEmploye.nom}
                      onChange={handleInputChange}
                      placeholder="Ranaivo"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#2b6cb0] text-sm"
                      required
                    />
                  </div>

                  {/* Prénom */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Prénom <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="prenom"
                      value={newEmploye.prenom}
                      onChange={handleInputChange}
                      placeholder="Jean"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#2b6cb0] text-sm"
                      required
                    />
                  </div>

                  {/* Téléphone */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Téléphone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="telephone"
                      value={newEmploye.telephone}
                      onChange={handleInputChange}
                      placeholder="0340000000"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#2b6cb0] text-sm"
                      required
                    />
                  </div>

                  {/* Poste */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Poste <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="poste"
                      value={newEmploye.poste}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#2b6cb0] text-sm"
                      required
                    >
                      <option value="">Sélectionner un poste</option>
                      <option value="Chef_Chantier">Chef de Chantier</option>
                      <option value="Conducteur_Travaux">Conducteur de Travaux</option>
                      <option value="Ingenieur">Ingénieur</option>
                      <option value="Macon">Maçon</option>
                      <option value="Chauffeur_Engin">Chauffeur d'Engin</option>
                      <option value="Ouvrier">Ouvrier</option>
                    </select>
                  </div>

                  {/* Salaire Journalier */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Salaire Journalier (Ar) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="salaire_journalier"
                      value={newEmploye.salaire_journalier}
                      onChange={handleInputChange}
                      placeholder="75000"
                      step="1000"
                      min="0"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#2b6cb0] text-sm"
                      required
                    />
                  </div>

                  {/* Projet */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Projet <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="id_projet"
                      value={newEmploye.id_projet}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#2b6cb0] text-sm"
                      required
                    >
                      <option value="">Sélectionner un projet</option>
                      {projets.map((p) => (
                        <option key={p.id_projet} value={p.id_projet}>
                          {p.nom_projet}
                        </option>
                      ))}
                    </select>
                  </div>
  
                  {/* Utilisateur (optionnel) */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Compte utilisateur (optionnel)
                    </label>
                    <select
                      name="id_utilisateur"
                      value={newEmploye.id_utilisateur}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#2b6cb0] text-sm"
                    >
                      <option value="">Aucun compte</option>
                      {utilisateurs.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.email}
                        </option>
                      ))}
                    </select>
                  </div>
                </div> 

                {/* Boutons d'action */}
                <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-[#1a365d] hover:bg-[#2b6cb0] text-white font-semibold px-6 py-2.5 rounded-lg shadow-md transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Embauche en cours...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Embaucher
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}