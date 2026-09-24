import {
  ChevronDown,
  ArrowLeft,
  LogOut,
  Moon,
  Sparkles,
  Sun,
  UserRound,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import { ThemeToggle } from './ThemeToggle';

interface AppHeaderProps {
  backLabel?: string;
}

export function AppHeader({ backLabel }: AppHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const signOut = useAuthStore((state) => state.signOut);
  const session = useAuthStore((state) => state.session);
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const name = sessionStorage.getItem('raffles-name') || 'Creador';
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeMenu = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', closeMenu);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeMenu);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-inner">
        {backLabel && (
          <button className="header-back" onClick={() => navigate('/inicio')}>
            <ArrowLeft size={16} /> {backLabel}
          </button>
        )}
        <button
          className="brand-mark dark brand-button"
          onClick={() => navigate('/inicio')}
        >
          <Sparkles size={17} /> rifas
        </button>
        <nav className="app-nav" aria-label="Navegación principal">
          <button
            className={`nav-link ${location.pathname === '/inicio' ? 'active' : ''}`}
            onClick={() => navigate('/inicio')}
          >
            Mis rifas
          </button>
          <button
            className={`nav-link ${location.pathname === '/cuenta' ? 'active' : ''}`}
            onClick={() => navigate('/cuenta')}
          >
            Mi cuenta
          </button>
        </nav>
        <div className="header-actions">
          <ThemeToggle />
          <div className="profile-menu" ref={menuRef}>
            <button
              className="profile-trigger"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span className="avatar">{name.slice(0, 1).toUpperCase()}</span>
              <ChevronDown size={15} className={menuOpen ? 'chevron-up' : ''} />
            </button>
            {menuOpen && (
              <div className="profile-dropdown">
                <div className="profile-summary">
                  <span className="avatar large">
                    {name.slice(0, 1).toUpperCase()}
                  </span>
                  <div>
                    <strong>{name}</strong>
                    <span>{session?.user.email || 'Modo demo'}</span>
                  </div>
                </div>
                <div className="profile-divider" />
                <button
                  className="profile-option"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate('/cuenta');
                  }}
                >
                  <UserRound size={16} /> Mi cuenta
                </button>
                <button className="profile-option" onClick={toggleTheme}>
                  {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}{' '}
                  Tema {theme === 'dark' ? 'claro' : 'oscuro'}
                </button>
                <button
                  className="profile-option logout-option"
                  onClick={() => void signOut().then(() => navigate('/'))}
                >
                  <LogOut size={16} /> Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
