export default function Poubelle() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-[#1a365d]">Corbeille / Poubelle</h2>
        <p className="text-gray-500 text-sm">Récupérez ou effacez définitivement les projets de la base de données.</p>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center text-gray-400">
        <p className="text-sm">Aucun projet dans la corbeille pour le moment.</p>
      </div>
    </div>
  );
}