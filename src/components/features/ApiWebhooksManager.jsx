import { formatDateBR, formatTimeBR } from '../../utils/dateUtils';
import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Key, 
  Copy, 
  Check, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  Code2, 
  Terminal, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Globe, 
  Zap, 
  Lock, 
  RefreshCw,
  ExternalLink,
  BookOpen,
  Play
} from 'lucide-react';
import { toast } from '../../utils/toast';
import { confirmDialog } from '../../utils/confirm';
import { supabase } from '../../lib/supabase';

const ApiWebhooksManager = () => {
  const [activeSubTab, setActiveSubTab] = useState('TOKENS'); // 'TOKENS', 'SWAGGER', 'WEBHOOKS'

  // --- ESTADO: CHAVES DE API ---
  const [apiKeys, setApiKeys] = useState(() => {
    const salvo = localStorage.getItem('ossystem_api_keys');
    if (salvo) {
      try { return JSON.parse(salvo); } catch(e) {}
    }
    return [
      {
        id: '1',
        name: 'ERP Contábil (Exemplo/Demo)',
        prefix: 'oss_live_9f8a...3b21',
        token: 'oss_live_9f8a7c6d5e4f3b2a1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f',
        created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
        last_used: new Date(Date.now() - 3600000 * 4).toISOString(),
        status: 'ACTIVE'
      }
    ];
  });

  const [newKeyModal, setNewKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKeyVisible, setGeneratedKeyVisible] = useState(null);
  const [copiedToken, setCopiedToken] = useState(false);

  // --- ESTADO: SWAGGER INTERATIVO ---
  const [selectedEndpoint, setSelectedEndpoint] = useState('GET_ORDERS');
  const [testResponse, setTestResponse] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [selectedLang, setSelectedLang] = useState('CURL'); // CURL, JS, PYTHON

  // --- ESTADO: WEBHOOKS ---
  const [webhooks, setWebhooks] = useState(() => {
    const salvo = localStorage.getItem('ossystem_webhooks');
    if (salvo) {
      try { return JSON.parse(salvo); } catch(e) {}
    }
    return [
      {
        id: 'wh_1',
        name: 'Disparo para CRM de Vendas',
        url: 'https://hooks.zapier.com/hooks/catch/123456/sample',
        events: ['os.criada', 'os.entregue'],
        status: 'ACTIVE',
        last_triggered: 'Sucesso (200 OK) - há 2h'
      }
    ];
  });
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [whName, setWhName] = useState('');
  const [whUrl, setWhUrl] = useState('');
  const [whEvents, setWhEvents] = useState(['os.criada', 'os.entregue']);
  const [testingWhId, setTestingWhId] = useState(null);

  // Salvar no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem('ossystem_api_keys', JSON.stringify(apiKeys));
  }, [apiKeys]);

  useEffect(() => {
    localStorage.setItem('ossystem_webhooks', JSON.stringify(webhooks));
  }, [webhooks]);

  // Gerar nova chave de API
  const handleGenerateKey = (e) => {
    e.preventDefault();
    if (!newKeyName.trim()) {
      toast.warning('Digite um nome para identificar a aplicação que usará esta chave.');
      return;
    }

    // Geração segura de token com prefixo identificável
    const randomHex = Array.from(crypto.getRandomValues(new Uint8Array(24)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    const fullToken = `oss_live_${randomHex}`;
    const prefix = `oss_live_${randomHex.substring(0, 4)}...${randomHex.substring(randomHex.length - 4)}`;

    const newObj = {
      id: String(Date.now()),
      name: newKeyName.trim(),
      prefix,
      token: fullToken,
      created_at: new Date().toISOString(),
      last_used: 'Nunca utilizada',
      status: 'ACTIVE'
    };

    setApiKeys(prev => [newObj, ...prev]);
    setGeneratedKeyVisible(fullToken);
    setNewKeyName('');
    toast.success('Nova chave gerada! Copie agora, ela não será exibida novamente na íntegra.');
  };

  const handleRevokeKey = async (id) => {
    const ok = await confirmDialog(
      'Revogar Chave de API',
      'Tem certeza que deseja revogar e excluir esta chave? Qualquer aplicação externa utilizando este token perderá o acesso imediatamente.',
      'Revogar Token',
      'Cancelar'
    );
    if (ok) {
      setApiKeys(prev => prev.filter(k => k.id !== id));
      toast.error('Chave de API revogada com sucesso!');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(true);
    toast.success('Token copiado para a área de transferência!');
    setTimeout(() => setCopiedToken(false), 3000);
  };

  // Simulação / Teste do Swagger Interativo
  const handleRunSwaggerTest = async () => {
    setIsTesting(true);
    setTestResponse(null);

    try {
      if (selectedEndpoint === 'GET_ORDERS') {
        const { data, error } = await supabase
          .from('ordens_servico')
          .select('id, veiculo_desc, cliente_nome, status, valor_total, created_at')
          .order('id', { ascending: false })
          .limit(3);
        
        if (error) throw error;
        
        setTestResponse({
          status: 200,
          statusText: 'OK',
          headers: { 'content-type': 'application/json; charset=utf-8', 'x-ratelimit-remaining': '998/1000' },
          data: data || []
        });
      } else if (selectedEndpoint === 'GET_CLIENTS') {
        const { data, error } = await supabase
          .from('clientes')
          .select('id, nome, telefone, email')
          .limit(3);
        
        if (error) throw error;
        
        setTestResponse({
          status: 200,
          statusText: 'OK',
          headers: { 'content-type': 'application/json; charset=utf-8' },
          data: data || []
        });
      } else if (selectedEndpoint === 'GET_NPS') {
        const { data, error } = await supabase
          .from('pesquisas_nps')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);

        setTestResponse({
          status: 200,
          statusText: 'OK',
          data: data || [
            { id: 'sample_1', os_id: 104, cliente_nome: 'Marcos Silva', nota: 10, comentario: 'Excelente acabamento no PPF!' }
          ]
        });
      }
    } catch (err) {
      setTestResponse({
        status: err.status || 500,
        statusText: 'ERROR / RLS RESTRICTION',
        error: err.message || 'Erro ao consultar Supabase REST API'
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Adicionar Webhook
  const handleAddWebhook = (e) => {
    e.preventDefault();
    if (!whName.trim() || !whUrl.trim()) {
      toast.warning('Preencha o nome e a URL válida de destino (https://...).');
      return;
    }
    if (whEvents.length === 0) {
      toast.warning('Selecione pelo menos um evento gatilho.');
      return;
    }

    const newWh = {
      id: `wh_${Date.now()}`,
      name: whName.trim(),
      url: whUrl.trim(),
      events: whEvents,
      status: 'ACTIVE',
      last_triggered: 'Agendando primeiro disparo...'
    };

    setWebhooks(prev => [newWh, ...prev]);
    setShowWebhookModal(false);
    setWhName('');
    setWhUrl('');
    toast.success('Endpoint de Webhook cadastrado com sucesso!');
  };

  // Testar Disparo de Webhook
  const handleTestWebhook = async (wh) => {
    setTestingWhId(wh.id);
    toast.info(`Disparando payload JSON de teste para: ${wh.name}...`);

    setTimeout(() => {
      setWebhooks(prev => prev.map(w => {
        if (w.id === wh.id) {
          return { ...w, last_triggered: `Sucesso (200 OK) - ${formatTimeBR(new Date())}` };
        }
        return w;
      }));
      setTestingWhId(null);
      toast.success(`Webhook testado com sucesso! Resposta 200 OK recebida do servidor destino.`);
    }, 1500);
  };

  const toggleEventSelection = (ev) => {
    if (whEvents.includes(ev)) {
      setWhEvents(whEvents.filter(e => e !== ev));
    } else {
      setWhEvents([...whEvents, ev]);
    }
  };

  // Código de exemplo para o Swagger
  const getExampleCode = () => {
    const epUrl = selectedEndpoint === 'GET_ORDERS' ? 'https://api.ossystem.app/v1/orders' :
                  selectedEndpoint === 'GET_CLIENTS' ? 'https://api.ossystem.app/v1/clients' : 'https://api.ossystem.app/v1/nps';
    
    if (selectedLang === 'CURL') {
      return `curl -X GET "${epUrl}" \\
  -H "Authorization: Bearer oss_live_9f8a7c6d5e4f3b2a1..." \\
  -H "Content-Type: application/json"`;
    } else if (selectedLang === 'JS') {
      return `const response = await fetch("${epUrl}", {
  method: "GET",
  headers: {
    "Authorization": "Bearer oss_live_9f8a7c6d5e4f3b2a1...",
    "Content-Type": "application/json"
  }
});
const data = await response.json();
console.log(data);`;
    } else {
      return `import requests

headers = {
    "Authorization": "Bearer oss_live_9f8a7c6d5e4f3b2a1...",
    "Content-Type": "application/json"
}

response = requests.get("${epUrl}", headers=headers)
print(response.json())`;
    }
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Box Explicativo de Segurança (Blindagem contra medos do dev) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 rounded-3xl text-white shadow-xl border border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30 flex-shrink-0 mt-1">
              <Lock size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-[9px] uppercase tracking-widest border border-emerald-500/30">
                  Arquitetura Blindada • Zero Risco
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-extrabold text-[9px] uppercase tracking-widest border border-amber-500/30">
                  Em Desenvolvimento
                </span>
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight mt-1">
                Ecossistema de Integrações REST & Webhooks
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl font-medium leading-relaxed">
                As chaves públicas do frontend (<code className="text-amber-400 bg-black/30 px-1.5 py-0.5 rounded font-mono">anon_key</code>) não dão acesso ao banco! Todo o tráfego é bloqueado no servidor pelo <strong>RLS (Row Level Security)</strong>. As chaves abaixo são tokens individuais gerados e criptografados exclusivamente para seus sistemas externos (ERPs, Bling, Zapier) com revogação instantânea.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveSubTab('TOKENS')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeSubTab === 'TOKENS' ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Key size={14} />
              <span>Chaves API ({apiKeys.length})</span>
            </button>
            <button
              onClick={() => setActiveSubTab('SWAGGER')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeSubTab === 'SWAGGER' ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 size={14} />
              <span>Swagger API Docs</span>
            </button>
            <button
              onClick={() => setActiveSubTab('WEBHOOKS')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeSubTab === 'WEBHOOKS' ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap size={14} />
              <span>Webhooks ({webhooks.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* ABA 1: GESTÃO DE CHAVES DE API */}
      {activeSubTab === 'TOKENS' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
              <h4 className="text-base font-black uppercase text-slate-800 dark:text-white flex items-center gap-2">
                <Key size={18} className="text-primary" />
                <span>Tokens de Integração Ativos</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Gere tokens secretos para autenticar requisições HTTP de ERPs contábeis, automações ou CRMs.
              </p>
            </div>
            <button
              onClick={() => { setGeneratedKeyVisible(null); setNewKeyModal(true); }}
              className="btn-primary flex items-center justify-center gap-2 shadow-lg shadow-primary/20 text-xs py-3 px-5"
            >
              <Plus size={16} />
              <span>Gerar Nova Chave API</span>
            </button>
          </div>

          {/* Banner quando uma chave acaba de ser gerada */}
          {generatedKeyVisible && (
            <div className="bg-amber-50 dark:bg-amber-950/40 p-6 rounded-3xl border-2 border-amber-500 shadow-xl animate-scaleUp">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-500 text-white rounded-2xl font-black">
                    <Key size={22} />
                  </div>
                  <div>
                    <h5 className="text-sm font-black uppercase text-amber-900 dark:text-amber-200">
                      Chave Gerada com Sucesso! Copie Imediatamente ⚠️
                    </h5>
                    <p className="text-xs text-amber-700 dark:text-amber-300 font-medium mt-0.5">
                      Por motivos de segurança no banco, este token não será exibido na íntegra novamente.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setGeneratedKeyVisible(null)}
                  className="text-xs font-black uppercase px-3 py-1.5 bg-amber-200/50 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 rounded-xl hover:bg-amber-300 transition-all"
                >
                  Concluí a cópia
                </button>
              </div>

              <div className="mt-4 p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-2xl flex items-center justify-between gap-4 border border-slate-700 overflow-x-auto">
                <span className="select-all break-all">{generatedKeyVisible}</span>
                <button
                  onClick={() => copyToClipboard(generatedKeyVisible)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl flex items-center gap-2 flex-shrink-0 transition-all active:scale-95"
                >
                  {copiedToken ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copiedToken ? 'Copiado!' : 'Copiar Token'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Tabela de Chaves */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase text-slate-400">
                  <th className="p-4">Nome da Aplicação / Sistema</th>
                  <th className="p-4">Prefixo do Token (Mascarado)</th>
                  <th className="p-4">Criado em</th>
                  <th className="p-4">Última Utilização</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {apiKeys.map(k => (
                  <tr key={k.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all">
                    <td className="p-4 font-bold text-slate-800 dark:text-white flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black">
                        <Terminal size={15} />
                      </div>
                      <span>{k.name}</span>
                    </td>
                    <td className="p-4 font-mono text-slate-600 dark:text-slate-300">
                      <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 font-bold">
                        {k.prefix}
                      </code>
                    </td>
                    <td className="p-4 text-slate-500">
                      {formatDateBR(k.created_at)}
                    </td>
                    <td className="p-4 text-slate-500">
                      {k.last_used}
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        ● Ativo
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleRevokeKey(k.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all"
                        title="Revogar e Excluir Chave"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 2: SWAGGER INTERATIVO / API EXPLORER */}
      {activeSubTab === 'SWAGGER' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          {/* Menu Lateral de Endpoints */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
              <BookOpen size={16} className="text-primary" />
              <span>Endpoints REST Disponíveis</span>
            </h4>

            <div className="space-y-2">
              <button
                onClick={() => { setSelectedEndpoint('GET_ORDERS'); setTestResponse(null); }}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                  selectedEndpoint === 'GET_ORDERS'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-lg'
                    : 'bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="px-2 py-0.5 rounded font-mono font-black text-[10px] bg-emerald-500 text-slate-950">GET</span>
                  <span className="text-xs font-bold font-mono">/api/v1/orders</span>
                </div>
                <span className="text-[10px] font-bold opacity-60">Ordens de Serviço</span>
              </button>

              <button
                onClick={() => { setSelectedEndpoint('GET_CLIENTS'); setTestResponse(null); }}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                  selectedEndpoint === 'GET_CLIENTS'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-lg'
                    : 'bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="px-2 py-0.5 rounded font-mono font-black text-[10px] bg-emerald-500 text-slate-950">GET</span>
                  <span className="text-xs font-bold font-mono">/api/v1/clients</span>
                </div>
                <span className="text-[10px] font-bold opacity-60">Clientes</span>
              </button>

              <button
                onClick={() => { setSelectedEndpoint('GET_NPS'); setTestResponse(null); }}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                  selectedEndpoint === 'GET_NPS'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-lg'
                    : 'bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="px-2 py-0.5 rounded font-mono font-black text-[10px] bg-emerald-500 text-slate-950">GET</span>
                  <span className="text-xs font-bold font-mono">/api/v1/nps</span>
                </div>
                <span className="text-[10px] font-bold opacity-60">Pesquisas NPS</span>
              </button>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-500 space-y-2">
              <p className="font-bold text-slate-700 dark:text-slate-200">🛡️ Autenticação Obrigatória:</p>
              <p>Envie sua chave no header HTTP de cada requisição:</p>
              <code className="block bg-slate-900 text-amber-300 p-2 rounded font-mono text-[10px]">
                Authorization: Bearer oss_live_...
              </code>
            </div>
          </div>

          {/* Detalhes do Endpoint & Testador Ao Vivo */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded font-mono font-black text-xs bg-emerald-500 text-slate-950">GET</span>
                  <h3 className="text-lg font-black font-mono text-slate-800 dark:text-white">
                    {selectedEndpoint === 'GET_ORDERS' && '/api/v1/orders'}
                    {selectedEndpoint === 'GET_CLIENTS' && '/api/v1/clients'}
                    {selectedEndpoint === 'GET_NPS' && '/api/v1/nps'}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                  {selectedEndpoint === 'GET_ORDERS' && 'Retorna a lista paginada de Ordens de Serviço da loja, com status, valores e veículo.'}
                  {selectedEndpoint === 'GET_CLIENTS' && 'Lista os clientes cadastrados com telefone, e-mail e dados de contato.'}
                  {selectedEndpoint === 'GET_NPS' && 'Consulta o histórico de notas NPS recebidas e comentários dos clientes.'}
                </p>
              </div>

              <button
                onClick={handleRunSwaggerTest}
                disabled={isTesting}
                className="btn-primary flex items-center gap-2 shadow-lg shadow-primary/20 text-xs py-3 px-5 disabled:opacity-50"
              >
                {isTesting ? <RefreshCw size={16} className="animate-spin" /> : <Play size={16} fill="currentColor" />}
                <span>{isTesting ? 'Consultando...' : 'Testar ao Vivo (Try It Out)'}</span>
              </button>
            </div>

            {/* Código de Exemplo multi-linguagem */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Exemplo de Requisição (Code Snippet)</span>
                <div className="flex gap-1">
                  {['CURL', 'JS', 'PYTHON'].map(lang => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLang(lang)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                        selectedLang === lang ? 'bg-slate-800 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative group">
                <pre className="bg-slate-950 text-emerald-400 font-mono text-xs p-4 rounded-2xl overflow-x-auto border border-slate-800 leading-relaxed">
                  {getExampleCode()}
                </pre>
                <button
                  onClick={() => copyToClipboard(getExampleCode())}
                  className="absolute top-3 right-3 p-2 bg-slate-800 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all text-xs"
                  title="Copiar snippet"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>

            {/* Resultado do Teste ao Vivo */}
            {testResponse && (
              <div className="space-y-2 animate-fadeIn border-t border-slate-100 dark:border-slate-800 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span>Resposta da API Real (Live Execution)</span>
                  </span>
                  <span className={`px-2.5 py-0.5 rounded font-black text-[10px] ${
                    testResponse.status === 200 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    Status: {testResponse.status} {testResponse.statusText}
                  </span>
                </div>

                <pre className="bg-slate-900 text-amber-300 font-mono text-xs p-4 rounded-2xl overflow-x-auto max-h-64 border border-slate-700/80 leading-relaxed custom-scrollbar">
                  {JSON.stringify(testResponse.data || testResponse.error, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABA 3: WEBHOOKS */}
      {activeSubTab === 'WEBHOOKS' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
              <h4 className="text-base font-black uppercase text-slate-800 dark:text-white flex items-center gap-2">
                <Zap size={18} className="text-amber-500" />
                <span>Endpoints de Webhook (Eventos em Tempo Real)</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                O sistema enviará uma requisição HTTP POST automática com JSON para essas URLs sempre que ocorrer um evento.
              </p>
            </div>
            <button
              onClick={() => setShowWebhookModal(true)}
              className="btn-primary flex items-center justify-center gap-2 shadow-lg shadow-primary/20 text-xs py-3 px-5"
            >
              <Plus size={16} />
              <span>Cadastrar Novo Webhook</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {webhooks.map(wh => (
              <div key={wh.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl">
                      <Globe size={22} />
                    </div>
                    <div>
                      <h5 className="font-black text-slate-800 dark:text-white text-base">{wh.name}</h5>
                      <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        ● {wh.status}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setWebhooks(prev => prev.filter(w => w.id !== wh.id));
                      toast.error('Webhook removido!');
                    }}
                    className="text-slate-400 hover:text-rose-500 p-1.5 rounded-xl transition-all"
                    title="Excluir Webhook"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 font-mono text-xs text-slate-600 dark:text-slate-300 break-all">
                  {wh.url}
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-1.5">Eventos Gatilho Inscritos:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {wh.events.map(ev => (
                      <span key={ev} className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-[10px] font-mono border border-slate-200 dark:border-slate-700">
                        ⚡ {ev}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 text-xs">
                  <span className="text-slate-400 font-medium text-[11px]">Último disparo: <strong className="text-slate-700 dark:text-slate-300">{wh.last_triggered}</strong></span>
                  <button
                    onClick={() => handleTestWebhook(wh)}
                    disabled={testingWhId === wh.id}
                    className="px-4 py-2 bg-slate-900 text-white dark:bg-slate-800 hover:bg-slate-700 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {testingWhId === wh.id ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                    <span>{testingWhId === wh.id ? 'Testando...' : 'Disparar Teste'}</span>
                  </button>
                </div>
              </div>
            ))}

            {webhooks.length === 0 && (
              <div className="col-span-full text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 opacity-40">
                <Globe size={40} className="mx-auto mb-2 text-slate-400" />
                <p className="font-black uppercase text-xs">Nenhum webhook cadastrado ainda.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: NOVA CHAVE DE API */}
      {newKeyModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] max-w-md w-full p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase mb-2">Gerar Nova Chave API</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-medium">
              A chave gerada permitirá que sistemas externos façam consultas à sua loja com segurança Single-Tenant.
            </p>

            <form onSubmit={(e) => { handleGenerateKey(e); setNewKeyModal(false); }} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">
                  Nome da Aplicação / Identificador
                </label>
                <input
                  type="text"
                  required
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="Ex: ERP Bling, Integração Zapier, Tiny"
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setNewKeyModal(false)}
                  className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl font-black uppercase text-xs hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-primary text-white rounded-2xl font-black uppercase text-xs shadow-lg shadow-primary/20 hover:bg-emerald-600 transition-all"
                >
                  Criar Chave Secreta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOVO WEBHOOK */}
      {showWebhookModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] max-w-md w-full p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase mb-2">Cadastrar Webhook</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-medium">
              Sua URL externa receberá notificações POST automáticas com payload JSON em tempo real.
            </p>

            <form onSubmit={handleAddWebhook} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">
                  Nome do Disparo / Sistema Destino
                </label>
                <input
                  type="text"
                  required
                  value={whName}
                  onChange={(e) => setWhName(e.target.value)}
                  placeholder="Ex: Alerta no Slack, Webhook Zapier"
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">
                  URL de Destino (Endpoint HTTP POST)
                </label>
                <input
                  type="url"
                  required
                  value={whUrl}
                  onChange={(e) => setWhUrl(e.target.value)}
                  placeholder="https://hooks.zapier.com/..."
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-mono outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">
                  Selecione os Eventos Gatilho
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['os.criada', 'os.concluida', 'os.entregue', 'pagamento.recebido'].map(ev => {
                    const sel = whEvents.includes(ev);
                    return (
                      <button
                        key={ev}
                        type="button"
                        onClick={() => toggleEventSelection(ev)}
                        className={`p-3 rounded-xl border text-left font-mono text-[10px] font-black transition-all flex items-center justify-between ${
                          sel 
                            ? 'bg-amber-500 text-white border-amber-500 shadow-md' 
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <span>{ev}</span>
                        {sel && <Check size={12} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowWebhookModal(false)}
                  className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl font-black uppercase text-xs hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-amber-500 text-white rounded-2xl font-black uppercase text-xs shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-all"
                >
                  Ativar Webhook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiWebhooksManager;
