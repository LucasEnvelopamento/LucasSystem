import React from 'react';
import { 
  ClipboardList, 
  History, 
  User, 
  LogOut,
  Bell
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useBrand } from '../../contexts/BrandContext';

const MobileLayout = ({ children, currentView, setView, title }) => {
  const { name } = useBrand();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { id: 'tarefas', icon: ClipboardList, label: 'Tarefas' },
    { id: 'historico', icon: History, label: 'Histórico' },
    { id: 'perfil', icon: User, label: 'Perfil' },
  ];

  const handleLogout = signOut;

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden font-sans">
      {/* Header Mobile */}
      <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shadow-sm flex-shrink-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-black text-xs">
            {name.charAt(0)}
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-800 leading-none">{title}</h1>
            <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">Operador</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-full relative">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
          </button>
          <button 
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-500 rounded-full"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-4 pb-24">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-2 py-1 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-40">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`flex flex-col items-center justify-center py-2 px-4 rounded-xl transition-all duration-300 ${
              currentView === item.id 
                ? 'text-primary scale-110' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <item.icon size={22} className={currentView === item.id ? 'stroke-[2.5px]' : ''} />
            <span className={`text-[9px] font-bold mt-1 uppercase tracking-wider ${
              currentView === item.id ? 'opacity-100' : 'opacity-60'
            }`}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default MobileLayout;
