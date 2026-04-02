import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, ChevronRight, X } from 'lucide-react';

export const ConfirmContainer = () => {
  const [modalData, setModalData] = useState(null);

  useEffect(() => {
    const handleConfirmEvent = (e) => {
      setModalData(e.detail);
    };

    window.addEventListener('app-confirm', handleConfirmEvent);
    return () => window.removeEventListener('app-confirm', handleConfirmEvent);
  }, []);

  const handleAction = (result) => {
    if (modalData && modalData.onResolve) {
      modalData.onResolve(result);
    }
    setModalData(null);
  };

  if (!modalData) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-scaleUp">
        <div className="p-6 pb-4 flex items-start gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center shrink-0 border border-amber-100">
            <AlertCircle size={24} />
          </div>
          <div className="flex-1 mt-1">
            <h3 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-2">{modalData.title}</h3>
            <p className="text-sm font-medium text-slate-500">{modalData.message}</p>
          </div>
        </div>
        
        <div className="p-4 pt-2 flex items-center gap-3 bg-slate-50/50">
          <button 
            onClick={() => handleAction(false)}
            className="flex-1 py-3 px-4 bg-slate-100 text-slate-500 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-colors"
          >
            {modalData.cancelText}
          </button>
          <button 
            onClick={() => handleAction(true)}
            className="flex-1 py-3 px-4 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-emerald-600 shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            {modalData.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
