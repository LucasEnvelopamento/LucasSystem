import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const DashboardLayout = ({ children, currentView, setView, title }) => {
  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      {/* Sidebar Fixa */}
      <Sidebar currentView={currentView} setView={setView} />

      {/* Área Principal de Conteúdo */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header title={title} />
        
        {/* Container de Scroll do Conteúdo */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar relative">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
