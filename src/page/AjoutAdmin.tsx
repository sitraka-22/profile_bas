import React, { useState, FormEvent } from 'react';
import api from '../service/api'; 

const AddAdminForm: React.FC = () => {
    // États pour les champs de la table 'utilisateur'
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    
    // États pour la gestion des retours (Succès / Erreur / Chargement)
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        // 1. Validation de sécurité basique côté client
        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }

        if (password.length < 6) {
            setError("Le mot de passe doit contenir au moins 6 caractères.");
            return;
        }

        setLoading(true);

        try {
            // 2. Appel de ton service API Axios
            // Envoie l'email et le password qui rempliront les colonnes de ta table
            const response = await api.post('/auth/register', { 
                email, 
                password 
            });

            // Récupération de la réponse renvoyée par le res.status(201).json(...) du backend
            const data = response.data;

            // 3. Réinitialisation des champs en cas de succès
            setSuccess(data.message || "Administrateur créé avec succès !");
            setEmail('');
            setPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            // 4. Gestion des erreurs Axios (ex: doublon d'email intercepté par la contrainte UNIQUE)
            if (err.response && err.response.data) {
                setError(err.response.data.message || "Une erreur est survenue.");
            } else {
                setError("Impossible de joindre le serveur Express.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>Ajouter un Administrateur</h2>
            
            {/* Affichage des messages d'état */}
            {error && <div style={{ color: 'red', marginBottom: '15px', fontWeight: 'bold' }}>{error}</div>}
            {success && <div style={{ color: 'green', marginBottom: '15px', fontWeight: 'bold' }}>{success}</div>}

            <form onSubmit={handleSubmit}>
                {/* Champ Email (Lié à la colonne 'email') */}
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>Adresse Email :</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>

                {/* Champ Mot de Passe (Sera haché par bcrypt côté backend avant d'aller dans 'password') */}
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>Mot de passe :</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>

                {/* Validation du Mot de Passe */}
                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '5px' }}>Confirmer le mot de passe :</label>
                    <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>

                {/* Bouton de soumission adaptatif */}
                <button 
                    type="submit" 
                    disabled={loading}
                    style={{ 
                        width: '100%', 
                        padding: '10px', 
                        backgroundColor: loading ? '#6c757d' : '#007BFF', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        cursor: loading ? 'not-allowed' : 'pointer' 
                    }}
                >
                    {loading ? 'Création en cours...' : "Créer l'administrateur"}
                </button>
            </form>
        </div>
    );
};

export default AddAdminForm;