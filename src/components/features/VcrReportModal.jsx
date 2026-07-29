import { formatDateBR, formatTimeBR } from '../../utils/dateUtils';
import React, { useRef } from 'react';
import { 
  Printer, 
  MessageCircle, 
  X, 
  ShieldCheck, 
  Car, 
  User, 
  Calendar, 
  Camera, 
  CheckCircle2, 
  AlertTriangle,
  FileText,
  QrCode
} from 'lucide-react';
import { useBrand } from '../../contexts/BrandContext';
import { toast } from '../../utils/toast';
import { sendWhatsApp } from '../../utils/whatsappUtils';

const VcrReportModal = ({ 
  isOpen, 
  onClose, 
  osData, 
  points = [], 
  generalNotes = '', 
  km = '', 
  signature = null 
}) => {
  const { name, colors, logoUrl, whatsapp } = useBrand();
  const printRef = useRef();

  if (!isOpen || !osData) return null;

  const handlePrint = () => {
    const printContents = printRef.current?.innerHTML;
    if (!printContents) return;

    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(node => node.outerHTML)
      .join('');
      
    const printWindow = window.open('', '_blank', 'width=850,height=1000');
    if (!printWindow) {
      toast.warning("Seu navegador bloqueou o pop-up. Por favor, permita pop-ups para gerar o laudo PDF.");
      return;
    }
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Laudo de Inspeção Digital (VCR) - OS #${osData.id}</title>
          ${styles}
          <style>
            @media print {
              body { background: white !important; margin: 0; padding: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
              @page { size: A4 portrait; margin: 1cm; }
              .no-print { display: none !important; }
              .page-break { page-break-before: always; }
            }
            body { background: white; font-family: system-ui, -apple-system, sans-serif; }
          </style>
        </head>
        <body class="bg-white p-0 m-0 text-slate-800">
          <div class="font-sans text-slate-900 bg-white max-w-[21cm] mx-auto p-4 md:p-8">
             ${printContents}
          </div>
          <script>
            setTimeout(() => {
              window.print();
              window.close();
            }, 600);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleSendWhatsApp = () => {
    const trackingUrl = `${window.location.origin}/status/${osData.tracking_token || osData.id}`;
    const totalDanos = points.length;
    const vehicleName = osData.carro || osData.veiculo || 'Veículo';
    const clientName = osData.cliente || osData.nome_cliente || 'Cliente';

    let msg = `*LAUDO DE INSPEÇÃO DIGITAL (VCR)* 📋🚗\n\n`;
    msg += `Olá, *${clientName}*! Aqui é da *${name}*.\n`;
    msg += `Realizamos a vistoria inicial e checklist visual de entrada do seu *${vehicleName}* na nossa recepção.\n\n`;
    msg += `📊 *Resumo da Vistoria:*\n`;
    msg += `• *OS:* #${osData.id}\n`;
    if (km) msg += `• *KM na Entrada:* ${km} km\n`;
    msg += `• *Pontos Mapeados:* ${totalDanos === 0 ? 'Nenhuma avaria inicial constatada' : `${totalDanos} ponto(s) de atenção registrado(s)`}\n`;
    msg += `• *Status da Assinatura:* ${signature ? '✔️ Assinado Digitalmente' : '⏳ Pendente'}\n\n`;
    if (generalNotes) {
      msg += `📝 *Observações:* ${generalNotes}\n\n`;
    }
    msg += `🔗 *Acompanhe em Tempo Real e Baixe seu Laudo PDF:*\n${trackingUrl}\n\n`;
    msg += `_Agradecemos pela confiança em nossos serviços!_ ✨`;

    const fone = osData.telefone || osData.celular || osData.fone || '';
    if (!fone) {
      toast.error("Telefone do cliente não cadastrado nesta Ordem de Serviço.");
      return;
    }

    sendWhatsApp(fone, msg);
    toast.success("Laudo do checklist enviado via WhatsApp!");
  };

  const getViewLabel = (viewId) => {
    const map = {
      superior: 'Visão Superior (Teto / Capô)',
      frontal: 'Vista Frontal (Frente)',
      traseira: 'Vista Traseira (Atrás)',
      lateral_esquerda: 'Lateral Esquerda',
      lateral_direita: 'Lateral Direita',
      perfil_esq: 'Perfil Esquerdo',
      perfil_dir: 'Perfil Direito'
    };
    return map[viewId] || viewId;
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-[#0f172a] w-full max-w-4xl rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Barra Superior de Controle (no-print) */}
        <div className="p-6 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 no-print">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-xl">
              <FileText size={24} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-primary block">
                Auditoria & Segurança Jurídica
              </span>
              <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">
                Laudo VCR (Vehicle Condition Report) — OS #{osData.id}
              </h3>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-5 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2 shadow-lg"
              title="Gerar e salvar em arquivo PDF ou Imprimir"
            >
              <Printer size={16} />
              <span>Salvar PDF / Imprimir</span>
            </button>

            <button
              onClick={handleSendWhatsApp}
              className="px-5 py-3 bg-[#25D366] text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
              title="Disparar resumo do laudo via WhatsApp"
            >
              <MessageCircle size={16} fill="white" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={onClose}
              className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all ml-2"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Área Visual do Relatório (Imprimível) */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-white text-slate-800 custom-scrollbar" ref={printRef}>
          <div className="max-w-3xl mx-auto space-y-8">
            
            {/* Cabeçalho do Laudo */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b-2 border-slate-900">
              <div className="flex items-center gap-4">
                {logoUrl ? (
                  <img src={logoUrl} alt={name} className="h-14 object-contain" />
                ) : (
                  <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-xl">
                    {name ? name.substring(0, 2).toUpperCase() : 'OS'}
                  </div>
                )}
                <div>
                  <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-900">{name || 'Estética Automotiva'}</h1>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Laudo Oficial de Inspeção e Condição Veicular (VCR)
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Ordem de Serviço</span>
                <span className="text-xl font-black text-slate-900">#{osData.id}</span>
                <span className="text-[10px] font-bold text-slate-500 block mt-0.5">
                  Emissão: {formatDateBR(new Date())} às {formatTimeBR(new Date())}
                </span>
              </div>
            </div>

            {/* Identificação do Cliente & Veículo */}
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Cliente / Proprietário</span>
                <span className="text-sm font-black text-slate-900 block truncate">{osData.cliente_nome || 'N/A'}</span>
                <span className="text-xs font-bold text-slate-500 block">{osData.cliente_telefone || 'Sem telefone'}</span>
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Veículo / Marca</span>
                <span className="text-sm font-black text-slate-900 block truncate">{osData.veiculo_desc || 'Veículo'}</span>
                <span className="text-xs font-bold text-slate-500 uppercase">{osData.veiculos?.cor || osData.cor || 'Cor N/A'}</span>
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Placa do Veículo</span>
                <span className="text-sm font-black font-mono bg-slate-900 text-white px-2.5 py-1 rounded-lg inline-block uppercase tracking-wider">
                  {osData.placa || 'PLACA'}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Quilometragem (KM)</span>
                <span className="text-sm font-black text-slate-900 block">
                  {km ? `${km} km` : 'Não registrado'}
                </span>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Recepção Inicial</span>
              </div>
            </div>

            {/* Observações Gerais da Recepção */}
            {generalNotes && (
              <div className="bg-amber-50 rounded-3xl p-5 border border-amber-200/80 text-amber-950">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 block mb-1 flex items-center gap-1.5">
                  <AlertTriangle size={14} /> Observações Gerais do Checklist na Recepção
                </span>
                <p className="text-xs font-bold leading-relaxed">{generalNotes}</p>
              </div>
            )}

            {/* Resumo Quantitativo */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-600" /> 
                Detalhamento de Danos e Avarias Mapeadas ({points.length})
              </h3>
              <span className="text-xs font-bold text-slate-500">
                {points.length === 0 ? '✔️ Veículo íntegro sem avarias visíveis' : '⚠️ Avarias pontuais constadas'}
              </span>
            </div>

            {/* Tabela de Avarias e Registros Fotográficos */}
            {points.length === 0 ? (
              <div className="py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-300 text-center space-y-2">
                <ShieldCheck size={36} className="text-emerald-500 mx-auto" />
                <h4 className="text-base font-black uppercase text-slate-800">Nenhum Ponto de Dano Registrado</h4>
                <p className="text-xs font-bold text-slate-500 max-w-md mx-auto">
                  A inspeção visual inicial na recepção atestou que a carroceria e vidros não apresentavam amassados, riscos ou avarias aparentes no momento da entrada.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
                      <th className="p-3 w-12 text-center">#</th>
                      <th className="p-3 w-44">Vista / Posição</th>
                      <th className="p-3 w-40">Tipo do Dano</th>
                      <th className="p-3">Descrição Técnica / Detalhe</th>
                      <th className="p-3 w-28 text-center">Foto Anexada</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs font-bold">
                    {points.map((pt, idx) => (
                      <tr key={pt.id || idx} className="hover:bg-slate-50">
                        <td className="p-3 text-center font-black bg-slate-100 text-slate-900 w-12">
                          {idx + 1}
                        </td>
                        <td className="p-3 text-slate-700 uppercase font-black text-[11px]">
                          {getViewLabel(pt.view)}
                        </td>
                        <td className="p-3">
                          <span className="bg-rose-100 text-rose-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg inline-block">
                            {pt.tipo || '⚡ Risco / Dano'}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600 font-medium">
                          {pt.descricao || 'Registrado na vistoria visual de entrada'}
                        </td>
                        <td className="p-3 text-center">
                          {pt.fotoUrl ? (
                            <a href={pt.fotoUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
                              <img 
                                src={pt.fotoUrl} 
                                alt={`Dano ${idx + 1}`} 
                                className="w-16 h-12 object-cover rounded-lg border border-slate-300 shadow-sm hover:scale-150 transition-transform" 
                              />
                            </a>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400 italic">Sem foto</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Termo de Consentimento e Assinatura */}
            <div className="pt-6 border-t-2 border-slate-900 space-y-6">
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 text-[11px] text-slate-600 leading-relaxed space-y-2">
                <span className="font-black text-slate-900 uppercase tracking-wider block">
                  🛡️ Termo Oficial de Conscientização de Estado Veicular na Recepção
                </span>
                <p>
                  O cliente/responsável abaixo assinado atesta a veracidade das informações constantes neste <b>Laudo de Inspeção Digital (VCR)</b>. As avarias e pontos de atenção listados e enumerados acima foram constatados de comum acordo na inspeção de entrada, isentando o estabelecimento de quaisquer reclamações futuras relativas à preexistência dos danos aqui indicados.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-end pt-4">
                <div className="space-y-2">
                  <div className="h-28 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center p-2 bg-slate-50/50">
                    {signature ? (
                      <img src={signature} alt="Assinatura Digital do Cliente" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span className="text-xs font-bold text-slate-400 italic">Assinatura digital não coletada no painel</span>
                    )}
                  </div>
                  <div className="border-t border-slate-400 pt-2 text-center sm:text-left">
                    <span className="text-xs font-black uppercase text-slate-900 block truncate">
                      {osData.cliente || osData.nome_cliente || 'Assinatura do Proprietário'}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                      Assinatura Digital — Recepção do Veículo
                    </span>
                  </div>
                </div>

                <div className="text-center sm:text-right space-y-1">
                  <div className="inline-block p-3 bg-slate-900 text-white rounded-2xl">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary block">Código de Rastreio VCR</span>
                    <span className="text-xs font-mono font-bold">{osData.tracking_token || osData.id}</span>
                  </div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pt-1">
                    Gerado digitalmente via {name || 'OsSystem'} — Proteção Jurídica e Qualidade
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Rodapé do Modal (no-print) */}
        <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 shrink-0 no-print">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
          >
            Fechar Laudo
          </button>
          <button
            onClick={handlePrint}
            className="px-8 py-3 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2"
          >
            <Printer size={16} />
            <span>Imprimir Laudo VCR</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default VcrReportModal;
