import React from "react";

// 1. Définition des types
interface StatCardProps {
  title: string;
  value: string | number;
  textColorClass: string;
  icon: React.ReactNode; // Ajout du type pour l'icône
}

interface ProjectItem {
  id: number;
  name: string;
  type: string;
  imageUrl: string;
  lastComment: string; // Ajout du champ commentaire
}

export default function Dashboard() {
  // 2. Simulation de données dynamiques avec icônes et commentaires
  const stats: StatCardProps[] = [
    {
      title: "Chantiers Actifs",
      value: 12,
      textColorClass: "text-[#1a365d]",
      icon: (
        <svg
          className="w-6 h-6 text-[#1a365d]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
    },
    {
      title: "Budget Global",
      value: "450 000 €",
      textColorClass: "text-green-600",
      icon: (
        <svg
          className="w-6 h-6 text-green-600"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      title: "Éléments Supprimés",
      value: 4,
      textColorClass: "text-red-500",
      icon: (
        <svg
          className="w-6 h-6 text-red-500"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      ),
    },
  ];

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

      {/* Cartes de statistiques avec Icônes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md flex items-center justify-between"
          >
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                {stat.title}
              </div>
              <div
                className={`text-3xl font-black mt-2 ${stat.textColorClass}`}
              >
                {stat.value}
              </div>
            </div>
            {/* Rond de fond pour l'icône */}
            <div className="p-3 rounded-xl bg-gray-50 flex items-center justify-center">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      <hr className="border-gray-100" />

      {/* Section : Galerie des Chantiers récents avec Commentaires */}
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

              {/* Zone du Commentaire en bas de carte */}
              <div className="p-4 pt-2 border-t border-gray-50 bg-gray-50/50 rounded-b-xl flex gap-2 items-start">
                {/* Petite icône de bulle de texte */}
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
