import React, { useState, useEffect } from 'react';
import { Settings, Save, Youtube, Palette, Type, Globe, CheckCircle2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { useBrand } from '../contexts/BrandContext';
import { supabase } from '../lib/supabase';

const SettingsPage = () => {
  const { updateConfig, ...brand } = useBrand();
  const [formData, setFormData] = useState({
    nome_loja: brand.name || '',
    logo_url: brand.logoUrl || '',
    youtube_id: brand.youtubeId || '',
    primary_color: brand.primaryColor || '#059669',
    secondary_color: brand.secondaryColor || '#1e293b'
  });

  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus({ type: '', message: '' });

    try {
      const { success, error } = await updateConfig(formData);
      if (!success) throw error;

      setStatus({ type: 'success', message: 'Configurações salvas com sucesso! As mudanças foram aplicadas em tempo real.' });
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'Erro ao salvar configurações. Verifique a conexão.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 fade-in pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Configurações do Sistema</h2>
          <p className="text-slate-500 text-sm">Personalize a identidade visual e o conteúdo da TV.</p>
        </div>
      </div>

      {status.message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 animate-slide-up ${
          status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
        }`}>
          {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <p className="text-sm font-bold">{status.message}</p>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Identidade Visual */}
        <div className="card-premium p-6 space-y-6">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-4">
            <Palette size={18} className="text-primary" /> Identidade Visual
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Nome da Loja</label>
              <div className="relative">
                <Type className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  value={formData.nome_loja}
                  onChange={(e) => setFormData({...formData, nome_loja: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="Ex: Auto Wrap Pro"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Link da Logomarca (URL)</label>
              <div className="relative">
                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="url" 
                  value={formData.logo_url}
                  onChange={(e) => setFormData({...formData, logo_url: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="Ex: https://meusite.com/logo.png"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-2 italic">Cole a URL de uma imagem para replicar na TV, Link do Cliente e Certificado.</p>
              {formData.logo_url && (
                <div className="mt-4 p-4 border border-slate-100 rounded-2xl bg-white flex items-center justify-center h-24">
                  <img src={formData.logo_url} alt="Logo Preview" className="max-h-16 object-contain" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Cor Primária</label>
                <input 
                  type="color" 
                  value={formData.primary_color}
                  onChange={(e) => setFormData({...formData, primary_color: e.target.value})}
                  className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl p-1 cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Cor Secundária</label>
                <input 
                  type="color" 
                  value={formData.secondary_color}
                  onChange={(e) => setFormData({...formData, secondary_color: e.target.value})}
                  className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl p-1 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Monitor TV Config */}
        <div className="card-premium p-6 space-y-6">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-4">
            <Youtube size={18} className="text-primary" /> Conteúdo da TV
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Link/ID do YouTube</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  value={formData.youtube_id}
                  onChange={(e) => setFormData({...formData, youtube_id: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="ID do vídeo ou link da playlist"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-2 italic">
                Dica: O ID de uma playlist geralmente começa com "PL...".
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
               <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Pré-visualização do Vídeo</h4>
               {formData.youtube_id ? (
                 <iframe 
                  className="w-full aspect-video rounded-xl bg-black"
                  src={`https://www.youtube.com/embed/${formData.youtube_id.includes('v=') ? formData.youtube_id.split('v=')[1] : formData.youtube_id}`}
                 ></iframe>
               ) : (
                 <div className="aspect-video bg-slate-200 rounded-xl flex items-center justify-center">
                    <Youtube className="text-slate-400" size={32} />
                 </div>
               )}
            </div>
          </div>
        </div>

        <div className="md:col-span-2 flex justify-end gap-3 pt-4">
           <button 
              type="submit"
              disabled={saving}
              className="bg-primary text-white px-8 py-4 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50"
           >
             {saving ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <Save size={18} />}
             Salvar Configurações
           </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
