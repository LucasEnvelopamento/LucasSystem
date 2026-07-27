export const PHOTO_PHASES = [
  { id: 'antes', label: 'Antes (Recepção)', shortLabel: 'Antes', icon: '📥', color: 'amber', description: 'Registro do estado inicial na recepção do veículo.' },
  { id: 'durante', label: 'Durante (Processo)', shortLabel: 'Durante', icon: '⚙️', color: 'blue', description: 'Registro de etapas intermediárias e detalhes técnicos.' },
  { id: 'depois', label: 'Depois (Acabamento)', shortLabel: 'Depois', icon: '📤', color: 'emerald', description: 'Registro do resultado final e acabamento para entrega.' }
];

export const PHOTO_ANGLES = [
  { id: 'frontal', label: 'Frontal', icon: '🏎️', description: 'Vista de frente (Capô, para-choque e faróis)' },
  { id: 'lateral_esq', label: 'Lateral Esquerda', icon: '🚗', description: 'Perfil esquerdo (Portas, paralamas e rodas)' },
  { id: 'lateral_dir', label: 'Lateral Direita', icon: '🚙', description: 'Perfil direito (Portas, paralamas e rodas)' },
  { id: 'traseira', label: 'Traseira', icon: '🚘', description: 'Vista de trás (Porta-malas, para-choque e lanternas)' },
  { id: 'livre', label: 'Detalhe / Livre', icon: '📷', description: 'Close-up de acabamento ou outro ângulo' }
];

export const getPhaseInfo = (phaseId) => {
  return PHOTO_PHASES.find(p => p.id === phaseId) || PHOTO_PHASES[1];
};

export const getAngleInfo = (angleId) => {
  return PHOTO_ANGLES.find(a => a.id === angleId) || PHOTO_ANGLES[4];
};
