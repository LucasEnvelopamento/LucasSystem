import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { BrandProvider } from './contexts/BrandContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import MobileLayout from './components/layout/MobileLayout';
import { useOrders } from './hooks/useData';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';

// Páginas
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Servicos from './pages/Servicos';
import Estoque from './pages/Materiais';
import Vendas from './pages/Vendas';
import OrdensServico from './pages/OrdensServico';
import Agenda from './pages/Agenda';
import Colaboradores from './pages/Colaboradores';
import SettingsPage from './pages/Settings';
import MonitorTV from './pages/MonitorTV';
import OperadorHome from './pages/OperadorHome';
import LoginPage from './pages/LoginPage';
import ExecutorView from './pages/ExecutorView';
import ProfilePage from './pages/Profile';
import CustomerStatus from './pages/CustomerStatus';

// Componente para Proteção de Rotas
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin shadow-xl"></div>
        {user && <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] animate-pulse">Sincronizando seu perfil...</p>}
      </div>
    );
  }

  if (!user) {
    if (location.pathname === '/login') return children;
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se o usuário está logado mas o perfil não existe (ex: tabela profiles não criada ou erro de banco)
  if (!profile && allowedRoles.length > 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="card-premium p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-xl font-black text-slate-800 uppercase mb-2">Acesso Restrito</h2>
          <p className="text-sm text-slate-500 font-medium mb-6">
            Seu usuário foi autenticado, mas não encontramos seu perfil de acesso. 
            Isso pode ocorrer se as tabelas do banco de dados ainda não foram configuradas.
          </p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="btn-primary w-full"
          >
            Voltar para Login
          </button>
        </div>
      </div>
    );
  }

  const userRole = String(profile?.cargo || '').toUpperCase();

  if (allowedRoles.length > 0 && !allowedRoles.map(r => String(r).toUpperCase()).includes(userRole)) {
    if (userRole === 'OPERADOR') {
      if (location.pathname === '/operador') return children; // fail-safe
      return <Navigate to="/operador" replace />;
    }
    
    // Evita loop infinito
    if (location.pathname === '/') {
      return (
         <div className="h-screen flex items-center justify-center bg-slate-50 p-6 text-center text-rose-500 font-bold uppercase tracking-widest text-xs">
             Acesso Negado: Perfil sem permissão para painel administrativo.
         </div>
      );
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

const getStatusClasses = (status) => {
    if (!status) return 'bg-slate-100 text-slate-600 border-slate-200';
    const s = String(status).toUpperCase();
    if (s.includes('CONCLU')) return 'bg-emerald-100 text-emerald-600 border-emerald-200';
    if (s.includes('EXECU')) return 'bg-blue-100 text-blue-600 border-blue-200';
    if (s.includes('AGUARDA')) return 'bg-amber-100 text-amber-600 border-amber-200';
    return 'bg-slate-100 text-slate-600 border-slate-200';
};

// Layout para o Operador (Mobile Friendly)
const OperadorLayoutWrapper = () => {
  const { profile } = useAuth();
  const [opView, setOpView] = useState('tarefas');
  const [selectedOS, setSelectedOS] = useState(null);
  const { orders } = useOrders();

  const titles = {
    tarefas: 'Minhas Tarefas',
    historico: 'Meu Histórico',
    perfil: 'Meu Perfil'
  };

  return (
    <MobileLayout 
      currentView={selectedOS ? 'execucao' : opView} 
      setView={setOpView} 
      title={selectedOS ? 'Executando Serviço' : titles[opView]}
    >
      {selectedOS ? (
        <ExecutorView 
          os={selectedOS} 
          onBack={() => setSelectedOS(null)}
          onComplete={() => {
            setSelectedOS(null);
            setOpView('historico');
          }}
        />
      ) : (
        <>
          {opView === 'tarefas' && <OperadorHome onSelectOS={setSelectedOS} />}
          {opView === 'historico' && (
            <div className="fade-in space-y-4">
               <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] pt-8 px-2">Seus Serviços Concluídos</h3>
               {(() => {
                 const history = (orders || []).filter(os => 
                    os && 
                    String(os.status || '').toUpperCase().includes('CONCLU') && 
                    os.tecnico_id === profile?.id
                 );
                 
                 if (history.length === 0) {
                   return (
                     <div className="py-20 text-center opacity-30">
                       <ShieldAlert size={48} className="mx-auto mb-3" />
                       <p className="text-[10px] font-black uppercase tracking-widest">Nenhum serviço econtrado no seu histórico</p>
                     </div>
                   );
                 }

                 return history.map(os => (
                   <div key={os.id} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100">
                        <CheckCircle2 size={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-black text-slate-800 uppercase truncate leading-tight">{os.veiculo_desc || 'Veículo'}</h4>
                          <span className="text-[9px] font-black text-slate-300">#{os.id}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 truncate">{os.servico || 'Serviço Executado'}</p>
                      </div>
                   </div>
                 ));
               })()}
            </div>
          )}
          {opView === 'perfil' && <ProfilePage />}
        </>
      )}
    </MobileLayout>
  );
};

const AppLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState('dashboard');

  useEffect(() => {
    const path = location.pathname.substring(1) || 'dashboard';
    setActivePage(path);
  }, [location]);

  const handleNavigate = (pageId) => {
    const path = pageId === 'dashboard' ? '/' : `/${pageId}`;
    navigate(path);
  };

  return (
    <div className="flex bg-[#F8FAFC] min-h-screen font-sans selection:bg-primary/10 selection:text-primary">
      <Sidebar activePage={activePage} setActivePage={handleNavigate} />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header activePage={activePage} />
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <BrandProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/tv" element={<MonitorTV />} />
            <Route path="/status/:id" element={<CustomerStatus />} />

            {/* Rotas Administrativas */}
            <Route path="/" element={<ProtectedRoute allowedRoles={['ADM', 'GESTOR']}><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
            <Route path="/clientes" element={<ProtectedRoute allowedRoles={['ADM', 'GESTOR']}><AppLayout><Clientes /></AppLayout></ProtectedRoute>} />
            <Route path="/vendas" element={<ProtectedRoute allowedRoles={['ADM', 'GESTOR']}><AppLayout><Vendas /></AppLayout></ProtectedRoute>} />
            <Route path="/ordens" element={<ProtectedRoute allowedRoles={['ADM', 'GESTOR', 'OPERADOR']}><AppLayout><OrdensServico /></AppLayout></ProtectedRoute>} />
            <Route path="/agenda" element={<ProtectedRoute allowedRoles={['ADM', 'GESTOR']}><AppLayout><Agenda /></AppLayout></ProtectedRoute>} />
            <Route path="/servicos" element={<ProtectedRoute allowedRoles={['ADM', 'GESTOR']}><AppLayout><Servicos /></AppLayout></ProtectedRoute>} />
            <Route path="/estoque" element={<ProtectedRoute allowedRoles={['ADM', 'GESTOR']}><AppLayout><Estoque /></AppLayout></ProtectedRoute>} />
            <Route path="/colaboradores" element={<ProtectedRoute allowedRoles={['ADM', 'GESTOR']}><AppLayout><Colaboradores /></AppLayout></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute allowedRoles={['ADM', 'GESTOR']}><AppLayout><SettingsPage /></AppLayout></ProtectedRoute>} />

            {/* Rota do Operador */}
            <Route path="/operador" element={<ProtectedRoute allowedRoles={['OPERADOR', 'ADM', 'GESTOR']}><OperadorLayoutWrapper /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrandProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
