import React, { useState, FormEvent } from 'react';
import api from '../service/api';

const AddAdminForm: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

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
            const response = await api.post('/auth/register', { email, password });
            setSuccess(response.data.message || "Administrateur créé avec succès !");

            // Réinitialisation du formulaire
            setEmail('');
            setPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            if (err.response && err.response.data) {
                setError(err.response.data.message || "Une erreur est survenue.");
            } else {
                setError("Impossible de joindre le serveur.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full">
                {/* Card Principale */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* En-tête de la carte */}
                    <div className="bg-[#1a365d] px-8 py-6 text-white">
                        <h2 className="text-2xl font-bold">Ajouter un Administrateur</h2>
                        <p className="text-blue-100 mt-1 text-sm">
                            Créer un nouvel accès administrateur pour COLASS
                        </p>
                    </div>

                    <div className="p-8">
                        {/* Messages de succès / erreur */}
                        {error && (
                            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm">
                                {success}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Adresse Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition"
                                    placeholder="admin@colass.com"
                                />
                            </div>

                            {/* Mot de passe */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Mot de passe
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition"
                                    placeholder="••••••••"
                                />
                            </div>

                            {/* Confirmation du mot de passe */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Confirmer le mot de passe
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition"
                                    placeholder="••••••••"
                                />
                            </div>

                            {/* Bouton */}
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-3.5 rounded-xl font-semibold text-white transition-all duration-200 ${loading
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.985]'
                                    }`}
                            >
                                {loading ? 'Création en cours...' : "Créer l'administrateur"}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Note de sécurité */}
                <p className="text-center text-xs text-gray-400 mt-6">
                    Les mots de passe sont sécurisés et chiffrés
                </p>
            </div>
        </div>
    );
};

export default AddAdminForm;