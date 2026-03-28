import React, { useRef } from 'react';
import { 
  FileCheck, 
  Printer, 
  ShieldCheck, 
  Calendar, 
  User, 
  Car, 
  Award,
  Shield,
  CheckCircle,
  QrCode,
  X
} from 'lucide-react';
import { useBrand } from '../../contexts/BrandContext';

const CertificadoGarantia = ({ os, onClose }) => {
  const { name, colors } = useBrand();
  const printRef = useRef();

  if (!os) return null;

  const handlePrint = () => {
    window.print();
  };

  const dataAtual = new Date().toLocaleDateString('pt-BR');
  
  // Lógica de validade baseada na OS ou padrão
  const garantiaTexto = os.garantia || '12 Meses';
  const dataValidade = os.data_validade || '19/03/2027';

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[200] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col relative animate-fadeIn no-print max-h-[90vh]">
        
        {/* Barra de Ações (Visualização) - Cabeçalho Fixo */}
        <div className="p-6 bg-slate-900 flex items-center justify-between border-b border-white/5 no-print shrink-0 z-50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                <FileCheck className="text-primary" size={24} />
            </div>
            <div>
                <h3 className="text-white font-black uppercase text-xs tracking-widest">Visualização do Certificado</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">OS #{os.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handlePrint}
              className="bg-primary hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
            >
              <Printer size={16} strokeWidth={3} /> Imprimir PDF
            </button>
            <button 
              onClick={onClose}
              className="p-3 hover:bg-white/10 rounded-full transition-all group"
            >
              <X size={24} className="text-slate-500 group-hover:text-white" />
            </button>
          </div>
        </div>

        {/* ÁREA DO CERTIFICADO (O QUE SERÁ IMPRESSO) - Corpo Rolável */}
        <div 
          ref={printRef}
          className="certificate-print-area flex-1 overflow-y-auto p-8 md:p-12 bg-white text-slate-900 font-sans print:p-0 custom-scrollbar"
        >
          <div className="border-[16px] border-slate-50 p-12 relative min-h-[900px] flex flex-col justify-between overflow-hidden">
            
            {/* Background Decor */}
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-slate-50 rounded-full blur-3xl opacity-50" />
            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-50" />
            
            {/* Ornamentos Premium */}
            <div className="absolute top-0 left-0 w-24 h-24 border-t-[6px] border-l-[6px] border-primary/20 rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-24 h-24 border-t-[6px] border-r-[6px] border-primary/20 rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 border-b-[6px] border-l-[6px] border-primary/20 rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 border-b-[6px] border-r-[6px] border-primary/20 rounded-br-lg"></div>

            {/* Header */}
            <div className="text-center space-y-6 relative">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-primary rounded-[2.5rem] shadow-2xl shadow-primary/20 mb-4">
                    <Shield size={48} className="text-white" strokeWidth={2.5} />
                </div>
                <h1 className="text-5xl font-black uppercase tracking-tighter text-slate-800 leading-none">{name || 'OsSystem'}</h1>
                <p className="text-sm font-black uppercase tracking-[0.5em] text-primary">Estética Automotiva de Elite</p>
                <div className="w-32 h-2 bg-slate-100 mx-auto rounded-full mt-8" />
            </div>

            {/* Title Body */}
            <div className="text-center space-y-4 my-8 relative">
                <h2 className="text-3xl font-serif italic text-slate-700">Certificado de Garantia</h2>
                <p className="max-w-xl mx-auto text-slate-400 font-medium leading-relaxed">
                    Este documento oficial atesta que o veículo descrito abaixo recebeu tratamentos de proteção e estética 
                    utilizando tecnologia de ponta, seguindo os mais rigorosos protocolos de qualidade.
                </p>
            </div>

            {/* Data Grid */}
            <div className="grid grid-cols-2 gap-12 py-10 border-y border-slate-50 my-8 relative">
                <div className="space-y-8">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                            <User size={24} />
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 block mb-1">Proprietário</span>
                            <p className="font-bold text-lg text-slate-800 uppercase tracking-tight">{os.cliente}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                            <Car size={24} />
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 block mb-1">Veículo Selecionado</span>
                            <p className="font-bold text-lg text-slate-800 uppercase tracking-tight">{os.veiculo}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                            <Award size={24} />
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 block mb-1">Número de Registro</span>
                            <p className="font-bold text-lg text-slate-800 uppercase tracking-tight">#{os.id.toString().padStart(4, '0')}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                            <Calendar size={24} />
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 block mb-1">Data de Execução</span>
                            <p className="font-bold text-lg text-slate-800 uppercase tracking-tight">{os.data || dataAtual}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Services List */}
            <div className="space-y-6 relative mb-12">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 text-center">Serviços e Proteções Aplicadas</h3>
                <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
                    {(os.servico || 'Estética Automotiva').split(',').map((s, idx) => (
                      <div key={idx} className="flex items-center gap-2 px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-tight text-slate-700 shadow-sm">
                          <CheckCircle size={14} className="text-emerald-500" />
                          {s.trim()}
                      </div>
                    ))}
                </div>
            </div>

            {/* Warranty Badge Premium */}
            <div className="bg-slate-900 rounded-[3rem] p-12 flex items-center justify-between text-white relative overflow-hidden group shadow-2xl">
                <Shield size={160} className="absolute -right-8 -top-8 text-white/5 rotate-12" />
                <div className="relative">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-50 mb-4 text-primary">Certificado de Proteção</h4>
                    <p className="text-5xl font-black tracking-tighter drop-shadow-md">{garantiaTexto}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest mt-4 flex items-center gap-2">
                        <Calendar size={12} className="text-primary" /> Válido até {dataValidade}
                    </p>
                </div>
                <div className="relative flex flex-col items-end gap-3 text-right">
                    <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-md border border-white/20">
                        <QrCode size={64} strokeWidth={1} />
                    </div>
                    <p className="text-[8px] font-black uppercase tracking-[0.3em] opacity-40">Autenticidade Verificada</p>
                </div>
            </div>

            {/* Signature Area */}
            <div className="mt-16 text-center space-y-8 pt-12 border-t border-slate-50 relative">
                <div className="flex justify-center gap-32">
                    <div className="flex flex-col items-center gap-2">
                         <div className="w-48 h-px bg-slate-200 mb-2" />
                         <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Responsável Técnico</p>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                         <div className="w-48 h-px bg-slate-200 mb-2" />
                         <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Diretor de Qualidade</p>
                    </div>
                </div>
                <p className="text-[8px] text-slate-300 font-medium italic tracking-wide max-w-sm mx-auto">
                    A validade desta garantia está condicionada à manutenção preventiva conforme manual do proprietário entregue no ato do serviço.
                </p>
            </div>

          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print { display: none !important; }
          body { 
            background: white !important; 
            margin: 0 !important; 
            padding: 0 !important; 
          }
          .fixed { position: static !important; }
          .rounded-[3rem] { border-radius: 0 !important; }
          .p-4 { padding: 0 !important; }
          .bg-slate-950\/80 { background: white !important; backdrop-filter: none !important; }
          .max-w-4xl { max-width: 100% !important; min-height: 100vh !important; }
          .shadow-2xl { box-shadow: none !important; }
          .certificate-print-area { p: 0 !important; }
          .border-[16px] { border-width: 0 !important; }
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
      `}} />
    </div>
  );
};

export default CertificadoGarantia;
