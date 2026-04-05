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
import { toast } from '../../utils/toast';

const CertificadoGarantia = ({ os, onClose }) => {
  const { name, colors, logoUrl } = useBrand();
  const printRef = useRef();

  if (!os) return null;

  const handlePrint = () => {
    const printContents = printRef.current.innerHTML;
    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(node => node.outerHTML)
      .join('');
      
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      toast.warning("Seu navegador bloqueou o pop-up. Por favor, permita pop-ups para imprimir o certificado.");
      return;
    }
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Certificado de Garantia - OS #${os.id}</title>
          ${styles}
          <style>
            @media print {
              body { background: white !important; margin: 0; padding: 0; }
              @page { size: A4 portrait; margin: 0.8cm; }
              .no-print { display: none !important; }
            }
            body { background: white; }
          </style>
        </head>
        <body class="bg-white p-0 m-0">
          <div class="font-sans text-slate-900 bg-white">
             ${printContents}
          </div>
          <script>
            // Pequeno delay para garantir que as fontes e os estilos Tailwind carreguem na nova janela
            setTimeout(() => {
              window.print();
              window.close();
            }, 500);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
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
          className="certificate-print-area flex-1 overflow-y-auto p-4 md:p-8 bg-white text-slate-900 font-sans print:p-0 custom-scrollbar"
        >
          <div className="border-[8px] print:border-0 border-slate-50 p-8 print:p-2 relative w-full max-w-[794px] mx-auto min-h-[1050px] print:min-h-0 print:h-[270mm] flex flex-col justify-between overflow-hidden">
            
            {/* Background Decor */}
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-slate-50 rounded-full blur-3xl opacity-50 print:hidden" />
            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-50 print:hidden" />
            
            {/* Ornamentos Premium */}
            <div className="absolute top-0 left-0 w-24 h-24 border-t-[6px] border-l-[6px] border-primary/20 rounded-tl-lg print:border-t-4 print:border-l-4"></div>
            <div className="absolute top-0 right-0 w-24 h-24 border-t-[6px] border-r-[6px] border-primary/20 rounded-tr-lg print:border-t-4 print:border-r-4"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 border-b-[6px] border-l-[6px] border-primary/20 rounded-bl-lg print:border-b-4 print:border-l-4"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 border-b-[6px] border-r-[6px] border-primary/20 rounded-br-lg print:border-b-4 print:border-r-4"></div>

            {/* Header */}
            <div className="text-center space-y-4 relative pt-4">
                <div className="flex items-center justify-center mb-2">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logomarca" className="h-24 w-auto max-w-[250px] object-contain drop-shadow-md rounded-2xl" />
                    ) : (
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-[2rem] shadow-xl shadow-primary/20 overflow-hidden p-2">
                        <Shield size={40} className="text-white" strokeWidth={2.5} />
                      </div>
                    )}
                </div>
                <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-800 leading-none">{name || 'OsSystem'}</h1>
                <p className="text-xs font-black uppercase tracking-[0.5em] text-primary">Estética Automotiva de Elite</p>
                <div className="w-24 h-1.5 bg-slate-100 mx-auto rounded-full mt-4" />
            </div>

            {/* Title Body */}
            <div className="text-center space-y-2 my-4 relative">
                <h2 className="text-2xl font-serif italic text-slate-700">Certificado de Garantia</h2>
                <p className="max-w-lg mx-auto text-slate-500 text-sm font-medium leading-relaxed px-4">
                    Este documento oficial atesta que o veículo descrito abaixo recebeu tratamentos de proteção e estética 
                    utilizando tecnologia de ponta, seguindo os mais rigorosos protocolos de qualidade.
                </p>
            </div>

            {/* Data Grid */}
            <div className="grid grid-cols-2 gap-8 py-6 border-y border-slate-50 my-4 relative">
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 print:bg-transparent">
                            <User size={20} />
                        </div>
                        <div>
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300 block mb-0.5">Proprietário</span>
                            <p className="font-bold text-base text-slate-800 uppercase tracking-tight">{os.cliente_nome || os.cliente}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 print:bg-transparent">
                            <Car size={20} />
                        </div>
                        <div>
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300 block mb-0.5">Veículo Selecionado</span>
                            <p className="font-bold text-base text-slate-800 uppercase tracking-tight">{os.veiculo_desc || os.veiculo}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 print:bg-transparent">
                            <Award size={20} />
                        </div>
                        <div>
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300 block mb-0.5">Número de Registro</span>
                            <p className="font-bold text-base text-slate-800 uppercase tracking-tight">#{os.id.toString().padStart(4, '0')}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 print:bg-transparent">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300 block mb-0.5">Data de Execução</span>
                            <p className="font-bold text-base text-slate-800 uppercase tracking-tight">{os.data || dataAtual}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Services List */}
            <div className="space-y-4 relative mb-6">
                <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 text-center">Serviços e Proteções Aplicadas</h3>
                <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
                    {(os.servico || 'Estética Automotiva').split(',').map((s, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 print:bg-transparent print:border-b border border-slate-100 print:border-slate-200 rounded-xl print:rounded-none text-[9px] font-black uppercase tracking-tight text-slate-700 shadow-sm print:shadow-none">
                          <CheckCircle size={12} className="text-emerald-500" />
                          {s.trim()}
                      </div>
                    ))}
                </div>
            </div>

            {/* Warranty Badge Premium */}
            <div className="bg-slate-900 print:bg-slate-100 print:text-slate-900 rounded-3xl print:rounded-2xl p-8 flex items-center justify-between text-white relative overflow-hidden group shadow-xl print:shadow-none print:border print:border-slate-300">
                <Shield size={120} className="absolute -right-6 -top-6 text-white/5 print:text-black/5 rotate-12" />
                <div className="relative">
                    <h4 className="text-[9px] font-black uppercase tracking-[0.4em] opacity-50 print:opacity-100 mb-2 text-primary">Certificado de Proteção</h4>
                    <p className="text-4xl font-black tracking-tighter drop-shadow-md print:drop-shadow-none print:text-slate-800">{garantiaTexto}</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest mt-2 flex items-center gap-1.5 print:text-slate-600">
                        <Calendar size={12} className="text-primary" /> Válido até {dataValidade}
                    </p>
                </div>
                <div className="relative flex flex-col items-end gap-2 text-right">
                    <div className="p-3 bg-white/10 print:bg-white rounded-2xl backdrop-blur-md border border-white/20 print:border-slate-200">
                        <QrCode size={48} strokeWidth={1} className="print:text-slate-800" />
                    </div>
                    <p className="text-[7px] font-black uppercase tracking-[0.3em] opacity-40 print:opacity-100 print:text-slate-500">Autenticidade Verificada</p>
                </div>
            </div>

            {/* Signature Area */}
            <div className="mt-8 text-center space-y-6 pt-8 border-t border-slate-100 relative">
                <div className="flex justify-center gap-24 print:gap-16">
                    <div className="flex flex-col items-center gap-2">
                         <div className="w-40 h-px bg-slate-300 mb-1" />
                         <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Responsável Técnico</p>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                         <div className="w-40 h-px bg-slate-300 mb-1" />
                         <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Diretor de Qualidade</p>
                    </div>
                </div>
                <p className="text-[7px] text-slate-400 font-medium italic tracking-wide max-w-sm mx-auto">
                    A validade desta garantia está condicionada à manutenção preventiva conforme manual do proprietário entregue no ato do serviço.
                </p>
            </div>

          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
      `}} />
    </div>
  );
};

export default CertificadoGarantia;
