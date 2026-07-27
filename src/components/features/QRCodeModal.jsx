import React, { useState } from 'react';
import { X, QrCode, Copy, Check, Printer, ShieldCheck, Share2, ExternalLink, Smartphone } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from '../../utils/toast';
import { sendWhatsApp, getVehicleReceivedMsg } from '../../utils/whatsappUtils';

const QRCodeModal = ({ os, onClose }) => {
  const [copied, setCopied] = useState(false);
  const trackingToken = os?.tracking_token || os?.id || '';
  const trackingUrl = `${window.location.origin}/status/${trackingToken}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(trackingUrl);
    setCopied(true);
    toast.success('Link de rastreamento copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const cleanPhone = (os?.cliente_telefone || '').replace(/\D/g, '');
    sendWhatsApp(
      cleanPhone || '11999999999', 
      getVehicleReceivedMsg(os?.cliente_nome || 'Cliente', os?.veiculo_desc || 'Veículo', trackingToken)
    );
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=600,height=600');
    if (!printWindow) {
      toast.error('Permita pop-ups para imprimir o QR Code.');
      return;
    }
    const svgEl = document.getElementById('client-qr-svg');
    const svgData = svgEl ? svgEl.outerHTML : '';
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Etiqueta QR Code - OS #${os?.id}</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              text-align: center;
              padding: 30px;
              margin: 0;
              background: #fff;
              color: #0f172a;
            }
            .tag-container {
              border: 3px solid #0f172a;
              border-radius: 20px;
              padding: 25px;
              max-width: 340px;
              margin: 0 auto;
            }
            .header {
              font-size: 14px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 2px;
              color: #4f46e5;
              margin-bottom: 5px;
            }
            .title {
              font-size: 22px;
              font-weight: 900;
              margin: 5px 0 15px 0;
            }
            .qr-box {
              padding: 15px;
              background: #f8fafc;
              border-radius: 15px;
              display: inline-block;
              margin-bottom: 15px;
            }
            .client-name {
              font-size: 16px;
              font-weight: bold;
              margin: 5px 0;
            }
            .vehicle {
              font-size: 14px;
              color: #64748b;
              margin: 0 0 15px 0;
              text-transform: uppercase;
            }
            .footer {
              font-size: 11px;
              color: #94a3b8;
              border-top: 1px dashed #cbd5e1;
              padding-top: 12px;
              line-height: 1.4;
            }
          </style>
        </head>
        <body>
          <div class="tag-container">
            <div class="header">Acompanhamento ao Vivo</div>
            <div class="title">OS #${os?.id || ''}</div>
            <div class="qr-box">
              ${svgData}
            </div>
            <div class="client-name">${os?.cliente_nome || 'Cliente'}</div>
            <div class="vehicle">${os?.veiculo_desc || 'Veículo'}</div>
            <div class="footer">
              Aponte a câmera do celular para este QR Code para acompanhar o status e progresso do seu veículo em tempo real.
            </div>
          </div>
          <script>
            setTimeout(() => {
              window.print();
              window.close();
            }, 300);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[500] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#111827] rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl border border-white/20 dark:border-slate-800 flex flex-col text-center relative animate-scaleUp">
        {/* Header */}
        <div className="p-6 bg-gradient-to-b from-purple-50/80 via-white to-transparent dark:from-slate-900 dark:via-[#111827] dark:to-transparent border-b border-purple-100/50 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <QrCode size={20} />
            </div>
            <div className="text-left">
              <h3 className="text-base font-black text-slate-800 dark:text-white uppercase tracking-tight">QR Code da Recepção</h3>
              <p className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest">OS #{os?.id} • {os?.cliente_nome}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-8 space-y-6 flex flex-col items-center">
          <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider border border-purple-200/60 dark:border-purple-800/50 shadow-sm animate-pulse">
            <Smartphone size={16} /> Aponte a câmera do celular
          </div>

          {/* Box do QR Code */}
          <div className="p-6 bg-white rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] border-2 border-purple-100 dark:border-purple-900/40 flex items-center justify-center transition-all hover:scale-105 duration-300">
            <QRCodeSVG 
              id="client-qr-svg"
              value={trackingUrl} 
              size={200} 
              level="H"
              includeMargin={true}
              bgColor="#ffffff"
              fgColor="#0f172a"
            />
          </div>

          <div className="space-y-1 w-full px-4">
            <p className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight truncate">{os?.veiculo_desc}</p>
            <p className="text-xs text-slate-400 dark:text-slate-300 font-medium">O cliente poderá visualizar o progresso e o checklist em tempo real sem precisar de senha ou cadastro.</p>
          </div>

          {/* Box de link */}
          <div className="w-full bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2">
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-300 truncate text-left flex-1 pl-2">{trackingUrl}</span>
            <button 
              onClick={handleCopy}
              className="px-3 py-2 bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-900/40 text-purple-600 dark:text-purple-300 rounded-xl font-bold text-xs flex items-center gap-1.5 border border-purple-100 dark:border-purple-800/50 shadow-sm transition-all shrink-0"
              title="Copiar Link"
            >
              {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
        </div>

        {/* Footer com Ações */}
        <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3">
          <button 
            onClick={handlePrint}
            className="w-full py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
          >
            <Printer size={16} className="text-slate-500 dark:text-slate-400" /> Imprimir Etiqueta
          </button>
          <button 
            onClick={handleWhatsApp}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
          >
            <Share2 size={16} /> Enviar WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
