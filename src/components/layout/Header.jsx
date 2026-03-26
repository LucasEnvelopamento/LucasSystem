import React from 'react';
import { Bell, Search, User, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Header = ({ activePage }) => {
  const { profile, signOut } = useAuth();
  
  const formattedPageName = activePage.charAt(0).toUpperCase() + activePage.slice(1);

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-black text-slate-800 tracking-tight uppercase tracking-tighter italic">
          {formattedPageName === 'Dashboard' ? 'Painel de Controle' : formattedPageName}
        </h2>
      </div>

      <div className="flex items-center gap-6">
        {/* Search Bar - Hidden on Mobile */}
        <div className="hidden md:flex relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Pesquisar..." 
            className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm w-64 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button className="p-2.5 bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all relative">
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white"></span>
          </button>
          
          <div className="h-8 w-[1px] bg-slate-100 mx-2"></div>

          <div className="flex items-center gap-3 pl-2">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-slate-800 leading-none mb-1">{profile?.nome || 'Usuário'}</p>
              <p className="text-[9px] font-black text-primary uppercase tracking-widest">{profile?.cargo || 'Membro'}</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 shadow-sm uppercase font-black">
              {profile?.nome?.charAt(0) || 'U'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
