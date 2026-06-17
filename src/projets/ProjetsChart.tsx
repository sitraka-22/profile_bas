import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface Projet {
  id_projet: number;
  nom_projet: string;
  description: string;
  type: 'Route' | 'Batiment' | 'Pont';
  date_debut: string | null;
  date_fin_prevue: string | null;
  budget: number | null;
  is_deleted: boolean;
}

interface ProjetsChartProps {
  projets: Projet[];
}

const ProjetsChart: React.FC<ProjetsChartProps> = ({ projets }) => {
  
  // 1. Préparation et agrégation des données
  const genererDonneesGraphique = () => {
    const aggregations: Record<string, { name: string; 'Budget Total (€)': number; 'Nombre de chantiers': number }> = {
      Route: { name: '🛣️ Routes', 'Budget Total (€)': 0, 'Nombre de chantiers': 0 },
      Batiment: { name: '🏢 Bâtiments', 'Budget Total (€)': 0, 'Nombre de chantiers': 0 },
      Pont: { name: '🌉 Ponts', 'Budget Total (€)': 0, 'Nombre de chantiers': 0 },
    };

    // On ne prend en compte que les projets actifs (non supprimés)
    projets.forEach((p) => {
      if (!p.is_deleted && aggregations[p.type]) {
        aggregations[p.type]['Budget Total (€)'] += p.budget || 0;
        aggregations[p.type]['Nombre de chantiers'] += 1;
      }
    });

    return Object.values(aggregations);
  };

  const data = genererDonneesGraphique();

  // Formateur personnalisé pour les montants du Tooltip (au survol)
  const formatTooltipBudget = (value: any) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-800">Analyse Graphique des Budgets et Activités</h2>
        <p className="text-xs text-gray-400">Répartition financière brute et volume par type d'infrastructure active.</p>
      </div>

      {projets.filter(p => !p.is_deleted).length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-400 italic text-sm">
          Aucune donnée disponible pour générer l'histogramme.
        </div>
      ) : (
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} />
              
              {/* Axe Y de gauche pour le Budget */}
              <YAxis 
                yAxisId="left" 
                orientation="left" 
                stroke="#2563eb" 
                fontSize={11}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k €`} 
              />
              
              {/* Axe Y de droite pour le Nombre de Chantiers */}
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                stroke="#10b981" 
                fontSize={11}
                allowDecimals={false}
              />
              
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'Budget Total (€)') return [formatTooltipBudget(value), name];
                  return [value, name];
                }}
                contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              
              {/* Barre 1 : Budgets (liée à l'axe gauche) */}
              <Bar yAxisId="left" dataKey="Budget Total (€)" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={40} />
              
              {/* Barre 2 : Quantités (liée à l'axe droit) */}
              <Bar yAxisId="right" dataKey="Nombre de chantiers" fill="#10b981" radius={[6, 6, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default ProjetsChart;