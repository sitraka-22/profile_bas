import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// 1. Définition des types
interface ProjectItem {
  id: number;
  name: string;
  type: string;
  imageUrl: string;
  lastComment: string;
}

export default function Dashboard() {
  // Données pour l'histogramme (à remplacer plus tard par des données réelles)
  const histogramData = [
    { name: "Routes", chantiers: 5, budget: 1250000 },
    { name: "Bâtiments", chantiers: 4, budget: 980000 },
    { name: "Ponts", chantiers: 3, budget: 750000 },
    { name: "Terrassement", chantiers: 2, budget: 420000 },
  ];

  // Simulation des projets récents
  const recentProjects: ProjectItem[] = [
    {
      id: 1,
      name: "Réhabilitation Route Nationale",
      type: "Infrastructure Routière",
      imageUrl:
        "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=500&q=80",
      lastComment:
        "Enrobé terminé sur le secteur Nord. Phase de marquage au sol imminente.",
    },
    {
      id: 2,
      name: "Construction Pont de la Lys",
      type: "Ouvrage d'art",
      imageUrl:
        "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=500&q=80",
      lastComment:
        "Coulage des piles terminé. Attente des résultats des tests de résistance.",
    },
    {
      id: 3,
      name: "Aménagement Zone Industrielle",
      type: "Bâtiment / Terrassement",
      imageUrl:
        "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=500&q=80",
      lastComment:
        "Retard constaté sur le terrassement à cause des fortes intempéries.",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* En-tête */}
      <div>
        <h2 className="text-2xl font-bold text-[#1a365d]">Tableau de Bord</h2>
        <p className="text-gray-500 text-sm">
          Vue d'ensemble des activités de l'entreprise COLASS.
        </p>
      </div>

      {/* ==================== HISTOGRAMME ==================== */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-[#1a365d] mb-4">
          Répartition des Chantiers par Type
        </h3>
        <div className="h-[380px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={histogramData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#4b5563', fontSize: 13 }}
              />
              <YAxis
                tick={{ fill: '#4b5563', fontSize: 13 }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  name === "budget"
                    ? `${value.toLocaleString('fr-FR')} €`
                    : value,
                  name === "budget" ? "Budget" : "Nombre de chantiers"
                ]}
              />
              <Legend />

              <Bar
                dataKey="chantiers"
                fill="#1e40af"
                name="Nombre de chantiers"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="budget"
                fill="#3b82f6"
                name="Budget (€)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Section : Galerie des Chantiers récents */}
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-lg font-bold text-[#1a365d]">
            Aperçu des Chantiers Récents
          </h3>
          <p className="text-xs text-gray-400">
            Suivi visuel et derniers rapports de terrain.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {recentProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Zone Image */}
                <div className="h-44 w-full bg-gray-100 overflow-hidden relative">
                  <img
                    src={project.imageUrl}
                    alt={project.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                {/* Infos du chantier */}
                <div className="p-4 pb-2">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-1">
                    {project.type}
                  </span>
                  <h4 className="font-bold text-sm text-[#1a365d] line-clamp-1">
                    {project.name}
                  </h4>
                </div>
              </div>

              {/* Zone du Commentaire */}
              <div className="p-4 pt-2 border-t border-gray-50 bg-gray-50/50 rounded-b-xl flex gap-2 items-start">
                <svg
                  className="w-4 h-4 text-gray-400 mt-0.5 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                  />
                </svg>
                <p className="text-xs text-gray-600 italic line-clamp-2 leading-relaxed">
                  "{project.lastComment}"
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}