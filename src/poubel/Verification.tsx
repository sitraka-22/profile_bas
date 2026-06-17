import React, { useState, useEffect } from 'react';
import api from '../service/api';
import jsPDF from 'jspdf';

interface Employe {
    id_employe: number;
    nom: string;
    prenom: string;
    poste: string;
    id_projet: number | null;
}

interface Projet {
    id_projet: number;
    nom_projet: string;
    type: 'Route' | 'Batiment' | 'Pont';
    status: string;
    is_deleted: boolean;
    description?: string;
    date_debut?: string | null;
    date_fin_prevue?: string | null;
    budget?: number | null;
}

const Verification: React.FC = () => {
    const [projets, setProjets] = useState<Projet[]>([]);
    const [employes, setEmployes] = useState<Employe[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [projetsRes, employesRes] = await Promise.all([
                api.get('/projets'),
                api.get('/employes'),
            ]);
            setProjets(projetsRes.data.filter((p: Projet) => !p.is_deleted));
            setEmployes(employesRes.data);
        } catch (error) {
            console.error(error);
            setErrorMsg("Impossible de récupérer les données de vérification.");
        } finally {
            setLoading(false);
        }
    };

    const employesParProjet = (idProjet: number) =>
        employes.filter((e) => e.id_projet === idProjet);

    const formatPoste = (poste: string) => poste.replace(/_/g, ' ');

    const formatDate = (dateStr: string | null | undefined) => {
        if (!dateStr) return 'Non spécifiée';
        return new Date(dateStr).toLocaleDateString('fr-FR');
    };

    // Génération du PDF pour un chantier précis
    const genererPDF = (projet: Projet) => {
        const equipe = employesParProjet(projet.id_projet);
        const doc = new jsPDF();
        const marginLeft = 20;
        let y = 20;

        // En-tête
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('COLASS - Fiche de Vérification Chantier', marginLeft, y);
        y += 10;

        doc.setDrawColor(26, 54, 93);
        doc.setLineWidth(0.5);
        doc.line(marginLeft, y, 190, y);
        y += 10;

        // Infos du chantier
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(projet.nom_projet, marginLeft, y);
        y += 8;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Type : ${projet.type === 'Batiment' ? 'Bâtiment' : projet.type}`, marginLeft, y);
        y += 6;
        doc.text(`Statut : ${projet.status || 'Non spécifié'}`, marginLeft, y);
        y += 6;
        doc.text(`Début : ${formatDate(projet.date_debut)}`, marginLeft, y);
        y += 6;
        doc.text(`Fin prévue : ${formatDate(projet.date_fin_prevue)}`, marginLeft, y);
        y += 6;
        if (projet.budget) {
            doc.text(`Budget : ${Number(projet.budget).toLocaleString('fr-FR')} Ar`, marginLeft, y);
            y += 6;
        }
        if (projet.description) {
            doc.text(`Description : ${projet.description}`, marginLeft, y, { maxWidth: 170 });
            y += 12;
        }

        y += 6;
        doc.setDrawColor(200, 200, 200);
        doc.line(marginLeft, y, 190, y);
        y += 10;

        // Liste du personnel
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`Personnel assigné (${equipe.length})`, marginLeft, y);
        y += 8;

        if (equipe.length === 0) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'italic');
            doc.text('Aucun employé assigné à ce chantier.', marginLeft, y);
        } else {
            doc.setFontSize(10);
            equipe.forEach((e, index) => {
                if (y > 270) {
                    doc.addPage();
                    y = 20;
                }
                doc.setFont('helvetica', 'bold');
                doc.text(`${index + 1}. ${e.nom.toUpperCase()} ${e.prenom || ''}`, marginLeft, y);
                doc.setFont('helvetica', 'normal');
                doc.text(`(${formatPoste(e.poste)})`, marginLeft + 80, y);
                y += 7;
            });
        }

        // Pied de page
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.text(
            `Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`,
            marginLeft,
            285
        );

        doc.save(`Verification_${projet.nom_projet.replace(/\s+/g, '_')}.pdf`);
    };

    return (
        <div className="p-6 max-w-6xl mx-auto bg-gray-50 min-h-screen font-sans">

            {/* En-tête */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Vérification des Chantiers</h1>
                <p className="text-sm text-gray-500">Vue d'ensemble des chantiers actifs et du personnel assigné.</p>
            </div>

            {errorMsg && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl text-sm text-red-700 font-medium mb-6">
                    {errorMsg}
                </div>
            )}

            {loading ? (
                <div className="text-center py-12 text-gray-500">Chargement des données de vérification...</div>
            ) : projets.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-16 text-center text-gray-400 italic">
                    Aucun chantier actif à vérifier pour le moment.
                </div>
            ) : (
                <div className="space-y-5">
                    {projets.map((p) => {
                        const equipe = employesParProjet(p.id_projet);
                        return (
                            <div key={p.id_projet} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                                {/* En-tête du chantier */}
                                <div className="px-5 py-4 bg-gray-50/70 border-b border-gray-100 flex justify-between items-center gap-3">
                                    <div className="flex items-center gap-3">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${p.type === 'Route' ? 'bg-amber-100 text-amber-800' :
                                                p.type === 'Batiment' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                            }`}>
                                            {p.type === 'Route' ? '🛣️ Route' : p.type === 'Batiment' ? '🏢 Bâtiment' : '🌉 Pont'}
                                        </span>
                                        <h2 className="font-bold text-gray-900">{p.nom_projet}</h2>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-gray-500 bg-white border border-gray-200 px-3 py-1 rounded-full whitespace-nowrap">
                                            {equipe.length} employé{equipe.length > 1 ? 's' : ''} assigné{equipe.length > 1 ? 's' : ''}
                                        </span>
                                        <button
                                            onClick={() => genererPDF(p)}
                                            className="inline-flex items-center gap-1.5 bg-[#1a365d] hover:bg-[#2b6cb0] text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition active:scale-95"
                                        >
                                            📄 Générer PDF
                                        </button>
                                    </div>
                                </div>

                                {/* Liste des employés du chantier */}
                                <div className="p-5">
                                    {equipe.length === 0 ? (
                                        <p className="text-sm text-gray-400 italic">Aucun employé assigné à ce chantier pour le moment.</p>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {equipe.map((e) => (
                                                <div
                                                    key={e.id_employe}
                                                    className="flex items-center gap-3 bg-gray-50/60 border border-gray-100 rounded-xl p-3"
                                                >
                                                    <div className="w-9 h-9 rounded-full bg-[#1a365d] text-white flex items-center justify-center font-bold text-sm shrink-0">
                                                        {e.nom.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-900 text-sm">
                                                            {e.nom.toUpperCase()} {e.prenom || ''}
                                                        </div>
                                                        <div className="text-xs text-gray-500">{formatPoste(e.poste)}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Verification;