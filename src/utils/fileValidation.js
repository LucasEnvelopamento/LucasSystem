/**
 * Módulo de Validação Rigorosa de Mídias (Hardening de Segurança - Fase 56)
 * Previne injeção de arquivos perigosos, arquivos corrompidos e exaustão de storage/banda no Supabase.
 */

export const validateMediaUpload = (file) => {
  if (!file) {
    return { valid: false, error: 'Nenhum arquivo selecionado.' };
  }

  // 1. Validação de Tamanho (Limite de 10MB em bytes)
  const MAX_SIZE_BYTES = 10 * 1024 * 1024;
  if (file.size > MAX_SIZE_BYTES) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `O arquivo excede o limite máximo de 10MB (Tamanho atual: ${sizeMB}MB).`
    };
  }

  // 2. Whitelist rigorosa de MIME types permitidos para mídias seguras
  const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/heic',
    'image/heif'
  ];

  if (!file.type || !ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: `Formato de arquivo não permitido (${file.type || 'desconhecido'}). Envie apenas imagens seguras (JPG, PNG, WEBP, GIF, HEIC).`
    };
  }

  return { valid: true };
};
