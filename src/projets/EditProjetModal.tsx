import React, { useState, useEffect } from "react";
import api from "../service/api";

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

interface EditProjetModalProps {
  isOpen: boolean;
  onClose: () => void;
  projet: Projet | null;
  onProjectUpdated: (projetMisAJour: Projet) => void;
}

const EditProjetModal: React.FC<EditProjetModalProps> = ({
  isOpen,
  onClose,
  projet,
  onProjectUpdated,
}) => {
  const [nom, setNom] = useState("");
  const descriptionState = useState(""); // Ajustement local pour éviter d'écraser la description
  const [description, setDescription] = descriptionState;
  const [type, setType] = useState<"Route" | "Batiment" | "Pont">("Route");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [budget, setBudget] = useState<number | string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (projet) {
      setNom(projet.nom_projet);
      setDescription(projet.description || "");
      setType(projet.type);
      setDateDebut(projet.date_debut ? projet.date_debut.split("T")[0] : "");
      setDateFin(
        projet.date_fin_prevue ? projet.date_fin_prevue.split("T")[0] : "",
      );
      setBudget(projet.budget || "");
    }
    setErrorMsg(null);
  }, [projet, isOpen]);

  if (!isOpen || !projet) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    // Validation métier locale : cohérence temporelle
    if (dateDebut && dateFin && new Date(dateDebut) > new Date(dateFin)) {
      setErrorMsg(
        "La date de livraison prévue ne peut pas être antérieure à la date de début de chantier.",
      );
      setLoading(false);
      return;
    }

    try {
      const response = await api.put(`/projets/${projet.id_projet}`, {
        nom_projet: nom,
        description: description || null,
        type,
        date_debut: dateDebut || null,
        date_fin_prevue: dateFin || null,
        budget: budget ? parseFloat(budget.toString()) : null,
      });

      if (response.status === 200) {
        // On récupère la ligne mise à jour directement renvoyée par le serveur Postgres (RETURNING *)
        onProjectUpdated(response.data.projet);
        onClose();
      }
    } catch (error: any) {
      console.error(error);
      setErrorMsg(
        error.response?.data?.message ||
          "Erreur lors de la communication avec le serveur COLASS.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-lg w-full overflow-hidden transform transition-all scale-100">
        {/* En-tête */}
        <div className="px-6 py-4 bg-gray-50/80 border-b border-gray-200/60 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Modifier le Chantier
            </h2>
            <p className="text-xs text-gray-500">
              Ajuster les clauses techniques et financières du lot actif.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1.5 hover:bg-gray-100 rounded-lg transition"
          >
            &times;
          </button>
        </div>

        {/* Formulaire */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 max-h-[75vh] overflow-y-auto"
        >
          {errorMsg && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-xl text-xs text-red-700 font-medium">
              ⚠️ {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Nom du projet *
            </label>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="w-full text-sm px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition border-gray-300"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Type d'Infrastructure *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full text-sm px-3 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition border-gray-300"
              >
                <option value="Route">🇲🇬 Route</option>
                <option value="Batiment">🏢 Bâtiment</option>
                <option value="Pont">🌉 Pont</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Budget alloué
              </label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="Ex: 50000"
                className="w-full text-sm px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition border-gray-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Début des travaux
              </label>
              <input
                type="date"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                className="w-full text-sm px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition border-gray-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Livraison prévue
              </label>
              <input
                type="date"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                className="w-full text-sm px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition border-gray-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Spécifications / Localisation technique
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full text-sm px-3 py-2 border rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none transition border-gray-300"
              placeholder="Détails géographiques ou exigences matérielles..."
            />
          </div>

          {/* Boutons d'actions */}
          <div className="flex space-x-3 pt-4 border-t justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium transition active:scale-95 disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-medium shadow-md shadow-blue-200 transition active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? "Application..." : "Sauvegarder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProjetModal;
