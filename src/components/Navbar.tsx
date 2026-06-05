interface NavbarProps {
  onNavigate: (page: string) => void;
  activePage: string;
}

export default function Navbar({ onNavigate, activePage }: NavbarProps) {
  return (
    <nav className="right-navbar">
      <div className="nav-logo">COLASS</div>
      <ul className="nav-links">
        <li className={activePage === 'dashboard' ? 'active' : ''} onClick={() => onNavigate('dashboard')}>
          Tableau de bord
        </li>
        <li className={activePage === 'projets' ? 'active' : ''} onClick={() => onNavigate('projets')}>
          Gestion Chantiers
        </li>
        <li className={activePage === 'poubelle' ? 'active' : ''} onClick={() => onNavigate('poubelle')}>
          Corbeille
        </li>
      </ul>
    </nav>
  );
}