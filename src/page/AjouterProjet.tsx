import { useState, FormEvent, ChangeEvent } from 'react';
import api from '../service/api';

// Définition de la structure de nos données de formulaire
interface ProjetFormData {
  nom: string;
  description: string;
  budget: number;
  date_debut: string;
}

export default function AjouterProjet() {
  const [formData, setFormData] = useState<ProjetFormData>({
    nom: '',
    description: '',
    budget: 0,
    date_debut: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Gestionnaire unique pour tous les champs de saisie
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'budget' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      // Envoi des données au backend PostgreSQL via Axios
      await api.post('/projets', formData);
      
      setMessage({ type: 'success', text: 'Le projet COLASS a été enregistré avec succès !' });
      // Réinitialisation du formulaire
      setFormData({ nom: '', description: '', budget: 0, date_debut: '' });
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || "Une erreur est survenue lors de l'enregistrement." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-card">
      <h2>Enregistrer un nouveau Chantier</h2>
      
      {message && (
        <div className={`form-alert ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="project-form">
        <div className="form-group">
          <label htmlFor="nom">Nom du Projet / Chantier</label>
          <input
            type="text"
            id="nom"
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description des travaux</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="budget">Budget Alloué (€ / MGA)</label>
          <input
            type="number"
            id="budget"
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            min="0"
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="date_debut">Date de Début</label>
          <input
            type="date"
            id="date_debut"
            name="date_debut"
            value={formData.date_debut}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>

        <button type="submit" className="submit-btn" disabled={isLoading}>
          {isLoading ? "Enregistrement..." : "Ajouter le Projet"}
        </button>
      </form>
    </div>
  );
}