import React from 'react';
import { Bell, Search, User, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../hooks/useData';

const Header = ({ activePage, onMenuClick }) => {
  const { profile, signOut } = useAuth();
  const { notifications, markAsRead, markAllAsRead, clearNotification } = useNotifications();
  const [showNotifications, setShowNotifications] = React.useState(false);

  const unreadCount = notifications.filter(n => !n.lida).length;
  
  const formattedPageName = activePage.charAt(0).toUpperCase() + activePage.slice(1);

  return (
    <header className="h-16 md:h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
      <div className="flex items-center gap-3 md:gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
        >
          <Menu size={24} />
        </button>
        <h2 className="text-base md:text-lg font-black text-slate-800 tracking-tight uppercase tracking-tighter italic whitespace-nowrap overflow-hidden text-ellipsis">
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
          {profile?.cargo !== 'OPERADOR' && (
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2.5 rounded-xl transition-all relative ${
                  showNotifications ? 'bg-primary/10 text-primary' : 'bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/5'
                }`}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
              </button>

              {/* Popover de Notificações */}
              {showNotifications && (
                <div className="absolute right-0 mt-4 w-80 bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-4 z-50">
                  <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Notificações</h3>
                    <div className="flex items-center gap-3">
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllAsRead}
                          className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline"
                        >
                          Limpar Tudo
                        </button>
                      )}
                      {unreadCount > 0 && <span className="text-[9px] bg-primary text-white px-2 py-0.5 rounded-full font-black uppercase">{unreadCount} NOVAS</span>}
                    </div>
                  </div>
                  
                  <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {notifications.filter(n => !n.lida).length > 0 ? (
                      notifications.filter(n => !n.lida).map((n) => (
                        <div 
                          key={n.id} 
                          className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors group relative bg-primary/5"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-xl mt-0.5 ${
                              n.tipo === 'ALERTA' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'
                            }`}>
                              <Bell size={14} />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-[11px] font-black text-slate-800 leading-tight uppercase mb-1">{n.titulo}</h4>
                              <p className="text-[10px] text-slate-500 font-medium leading-relaxed mb-3">{n.mensagem}</p>
                              <div className="flex items-center gap-2">
                                {!n.lida && (
                                  <button 
                                    onClick={() => markAsRead(n.id)}
                                    className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline"
                                  >
                                    Limpar Alerta
                                  </button>
                                )}
                                <span className="text-[8px] text-slate-300 font-bold uppercase">{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-10 text-center flex flex-col items-center gap-3 opacity-30">
                        <Bell size={32} />
                        <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">Nenhuma notificação <br /> por enquanto</p>
                      </div>
                    )}
                  </div>
                  
                  {notifications.length > 0 && (
                    <div className="p-3 bg-slate-50 border-t border-slate-100">
                       <button 
                         onClick={() => setShowNotifications(false)}
                         className="w-full py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                       >
                         Fechar Painel
                       </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {profile?.cargo !== 'OPERADOR' && <div className="h-8 w-[1px] bg-slate-100 mx-2"></div>}

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
