
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppState } from '../store';
import { UserRole } from '../types';
import {
  LayoutDashboard,
  FilePlus,
  Search,
  Calendar,
  Gavel,
  BarChart3,
  Scale,
  BookOpen,
  History,
  LogOut,
  ChevronDown,
  FileText
} from 'lucide-react';

const SidebarLink = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active: boolean }) => (
  <Link
    to={to}
    className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${active
      ? 'bg-blue-700 text-white shadow-md'
      : 'text-blue-100 hover:bg-blue-600 hover:text-white'
      }`}
  >
    <Icon size={18} />
    <span className="font-medium text-sm">{label}</span>
  </Link>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUserRole, logout, userFullName } = useAppState();

  const isAudiencier = currentUserRole === UserRole.GREFFIER_AUDIENCE;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-800 text-white flex flex-col shadow-xl z-20">
        <div className="p-6 flex items-center space-x-2 border-b border-blue-700/50">
          <Scale size={32} className="text-yellow-400" />
          <div className="flex flex-col">
            <h1 className="text-lg font-bold leading-tight">SIGA-TT</h1>
            <span className="text-[10px] text-blue-200 uppercase tracking-tighter">Tribunal du Travail</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto custom-scrollbar">
          <div className="text-[10px] font-black text-blue-300 uppercase px-3 py-2 tracking-widest opacity-50">Menu Principal</div>
          <SidebarLink to="/" icon={LayoutDashboard} label="Tableau de bord" active={location.pathname === '/'} />
          <SidebarLink to="/enrolement" icon={FilePlus} label="Enrôlement" active={location.pathname === '/enrolement'} />
          <SidebarLink to="/affaires" icon={Search} label="Rôle Général" active={location.pathname === '/affaires'} />
          <SidebarLink to="/audiences" icon={Calendar} label="Planification" active={location.pathname === '/audiences'} />

          {isAudiencier && (
            <>
              <div className="text-[10px] font-black text-blue-300 uppercase px-3 py-4 tracking-widest opacity-50">Registres</div>
              <SidebarLink to="/plumitif-conciliation" icon={BookOpen} label="Plumitif Conciliation" active={location.pathname === '/plumitif-conciliation'} />
              <SidebarLink to="/plumitif-audiences" icon={Gavel} label="Plumitif Jugement" active={location.pathname === '/plumitif-audiences'} />
            </>
          )}

          <div className="text-[10px] font-black text-blue-300 uppercase px-3 py-4 tracking-widest opacity-50">Opérations</div>
          <SidebarLink to="/session" icon={FileText} label="Audience du Jour" active={location.pathname === '/session'} />
          {isAudiencier && <SidebarLink to="/reporting" icon={BarChart3} label="Statistiques" active={location.pathname === '/reporting'} />}
        </nav>

        <div className="p-4 border-t border-blue-700 bg-blue-900/30">
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${isAudiencier ? 'bg-indigo-500' : 'bg-green-500'}`}>
                {isAudiencier ? 'GA' : 'GC'}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-semibold truncate leading-none" title={userFullName || 'Utilisateur'}>
                  {userFullName || 'M. Koffi ADOM'}
                </span>
                <span className="text-[9px] text-blue-300 uppercase font-bold mt-1">
                  {isAudiencier ? 'Audiencier' : 'Accueil'}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-blue-300 hover:text-white hover:bg-blue-700 rounded-lg transition-all"
              title="Déconnexion"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-auto">
        <header className="h-16 bg-white border-b flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-500">
              <Scale size={18} />
              <h2 className="text-sm font-bold uppercase tracking-wide">
                {location.pathname === '/' ? 'Tableau de Bord' :
                  location.pathname === '/plumitif-conciliation' ? 'Registre des Conciliations' :
                    location.pathname === '/plumitif-audiences' ? 'Registre des Jugements' :
                      'Système de Gestion'}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-gray-800">Tribunal du Travail de Lomé</p>
              <p className="text-[10px] text-gray-400 font-medium">République Togolaise</p>
            </div>
            <div className="h-8 w-[1px] bg-gray-200"></div>
            <span className="text-sm font-medium text-gray-500 flex items-center">
              <Calendar size={16} className="mr-2 text-blue-500" />
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </div>
        </header>

        <div className="p-8 pb-20 max-w-[1600px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
};
