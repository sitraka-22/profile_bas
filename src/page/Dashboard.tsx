export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-[#1a365d]">Tableau de Bord</h2>
        <p className="text-gray-500 text-sm">Vue d'ensemble des activités de l'entreprise COLASS.</p>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Chantiers Actifs</div>
          <div className="text-3xl font-black text-[#1a365d] mt-2">12</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Budget Global</div>
          <div className="text-3xl font-black text-green-600 mt-2">450 000 €</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Éléments Supprimés</div>
          <div className="text-3xl font-black text-red-500 mt-2">4</div>
        </div>
      </div>
    </div>
  );
}