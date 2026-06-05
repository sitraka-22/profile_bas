import { ReactNode } from 'react';
import Navbar from '../navbar';

interface MainLayoutProps {
  children: ReactNode;
  subMenu?: ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
}

export default function MainLayout({ children, subMenu, activePage, onNavigate }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-row bg-gray-50 font-sans w-full">
      
      {/* Côté Gauche : Empilement Vertical (Header -> Body -> Footer) */}
      <div className="flex flex-1 flex-col min-h-screen overflow-x-hidden">
        
        {/* Header de l'application */}
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-8 shadow-sm shrink-0">
          <h1 className="text-xl font-bold text-[#1a365d] tracking-wide">COLASS Entreprise</h1>
          <div className="text-sm text-gray-500 font-medium">Espace Administration</div>
        </header>
        
        {/* Zone Centrale du Body */}
        <div className="flex flex-1 items-stretch">
          {/* Si un sous-menu de module existe, il se glisse ici à gauche du contenu */}
          {subMenu && (
            <aside className="w-56 border-r border-gray-200 bg-gray-100 p-6 shrink-0">
              {subMenu}
            </aside>
          )}
          
          {/* Contenu principal de la page active */}
          <main className="flex-1 p-8 bg-gray-50 overflow-y-auto">
            {children}
          </main>
        </div>
        
        {/* Footer de l'application */}
        <footer className="flex h-12 items-center justify-center border-t border-gray-200 bg-white text-xs text-gray-400 shrink-0">
          <p>&copy; {new Date().getFullYear()} COLASS &bull; Tous droits réservés.</p>
        </footer>
      </div>

     
      <Navbar {...({ activePage, onNavigate } as any)} />
    </div>
  );
}