import React, { useState, useEffect } from "react";
import api from "../service/api";

interface Projet {
  id_projet: number;
  nom_projet: string;
}

interface Employe {
  id_employe: number;
  nom: string;
  prenom?: string;
}

interface Demande {
  id_demande: number;
  titre_demande: string;
  description: string;
  id_projet: number;
  id_employe?: number;
}

interface EditDemandeModalProps {
  isOpen: boolean;
  onClose: () => void;
  demande: Demande | null;
  onDemandeUpdated: () => void;
}

const EditDemandeModal: React.FC<EditDemandeModalProps> = ({
  isOpen,
  onClose,
  demande,
  onDemandeUpdated,
}) => {
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [idProjet, setIdProjet] = useState("");
  const [idEmploye, setIdEmploye] = useState("");

  const [projets, setProjets] = useState<Projet[]>([]);
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Charger les listes de liaison au chargement
  useEffect(() => {
    if (isOpen) {
      const fetchLists = async () => {
        try {
          const [projetsRes, employesRes] = await Promise.all([
            api.get("/projets"),
            api.get("/employes"),
          ]);
          setProjets(
            projetsRes.data.filter((p: any) => !p.is_deleted && !p.is_delete),
          );
          setEmployes(employesRes.data.filter((e: any) => !e.is_delete));
        } catch (err) {
          console.error("Erreur chargement des listes :", err);
        }
      };
      fetchLists();
    }
  }, [isOpen]);

  // Remplir les champs lorsque la demande sélectionnée change
  useEffect(() => {
    if (demande) {
      setTitre(demande.titre_demande || "");
      setDescription(demande.description || "");
      setIdProjet(String(demande.id_projet || ""));
      setIdEmploye(String(demande.id_employe || ""));
    }
  }, [demande, isOpen]);

  if (!isOpen || !demande) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await api.put(`/demandes/${demande.id_demande}`, {
        titre_demande: titre,
        description,
        id_projet: parseInt(idProjet, 10),
        id_employe: parseInt(idEmploye, 10),
      });

      if (response.status === 200) {
        onDemandeUpdated();
        onClose();
      }
    } catch (error: any) {
      setErrorMsg(
        error.response?.data?.error ||
          "Erreur lors de la mise à jour de la demande.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-md w-full overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-gray-800">
              Modifier la demande logistique
            </h2>
            <p className="text-xs text-gray-400">
              Ajustement des spécifications du besoin terrain.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded text-xs text-red-700 font-medium">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Titre de la demande *
            </label>
            <input
              type="text"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Chantier rattaché *
            </label>
            <select
              value={idProjet}
              onChange={(e) => setIdProjet(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            >
              <option value="">-- Sélectionner le chantier --</option>
              {projets.map((p) => (
                <option key={p.id_projet} value={p.id_projet}>
                  🏗️ {p.nom_projet}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Employé émetteur *
            </label>
            <select
              value={idEmploye}
              onChange={(e) => setIdEmploye(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            >
              <option value="">-- Responsable sur site --</option>
              {employes.map((e) => (
                <option key={e.id_employe} value={e.id_employe}>
                  👤 {e.nom} {e.prenom || ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Description détaillée
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full text-xs px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
            />
          </div>

          <div className="flex space-x-3 pt-3 border-t border-gray-100 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold py-2 px-4 rounded-xl"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-5 rounded-xl shadow-md disabled:opacity-50"
            >
              {loading ? "Application..." : "Enregistrer les modifications"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDemandeModal;
