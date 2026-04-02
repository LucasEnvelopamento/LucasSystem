import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToastEvent = (e) => {
      const newToast = e.detail;
      setToasts((prev) => [...prev, newToast]);

      // Auto-remover após 4 segundos
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 4000);
    };

    window.addEventListener('app-toast', handleToastEvent);
    return () => window.removeEventListener('app-toast', handleToastEvent);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  );
};

const Toast = ({ toast, onClose }) => {
  const { type, message } = toast;

  const typeConfig = {
    success: {
      icon: <CheckCircle2 className="text-emerald-500 shrink-0" size={24} />,
      bg: 'bg-white',
      border: 'border-l-4 border-l-emerald-500 border-y border-y-slate-100 border-r border-r-slate-100',
    },
    error: {
      icon: <XCircle className="text-rose-500 shrink-0" size={24} />,
      bg: 'bg-white',
      border: 'border-l-4 border-l-rose-500 border-y border-y-slate-100 border-r border-r-slate-100',
    },
    warning: {
      icon: <AlertTriangle className="text-amber-500 shrink-0" size={24} />,
      bg: 'bg-white',
      border: 'border-l-4 border-l-amber-500 border-y border-y-slate-100 border-r border-r-slate-100',
    },
    info: {
      icon: <Info className="text-blue-500 shrink-0" size={24} />,
      bg: 'bg-white',
      border: 'border-l-4 border-l-blue-500 border-y border-y-slate-100 border-r border-r-slate-100',
    },
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <div className={`pointer-events-auto flex items-start gap-4 p-4 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] ${config.bg} ${config.border} animate-fadeIn`}>
      {config.icon}
      <p className="flex-1 text-sm font-medium text-slate-700 leading-snug mt-0.5">{message}</p>
      <button 
        onClick={onClose}
        className="text-slate-400 hover:text-slate-600 transition-colors p-1 -mr-2 -mt-1"
      >
        <X size={16} />
      </button>
    </div>
  );
};
