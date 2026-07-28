/**
 * Otimiza e comprime uma imagem usando HTML5 Canvas antes do upload.
 * Útil para reduzir fotos de câmeras de smartphones (5-15MB) para tamanhos aceitáveis (100-300KB)
 * preservando a qualidade essencial para auditorias.
 * 
 * @param {File} file - Arquivo de imagem original
 * @param {number} maxWidth - Largura máxima permitida (default 1280px)
 * @param {number} maxHeight - Altura máxima permitida (default 1280px)
 * @param {number} quality - Qualidade do JPEG (0.0 a 1.0, default 0.7)
 * @returns {Promise<File>} - Nova instância de File comprimida
 */
export const compressImage = async (file, maxWidth = 1280, maxHeight = 1280, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    // Apenas tenta comprimir se for uma imagem
    if (!file.type.match(/image.*/)) {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.onerror = (error) => reject(error);
    
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = (error) => reject(error);
      
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Mantém a proporção se a imagem for maior que o máximo permitido
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        // Preenche com fundo branco caso tenha transparência e estejamos exportando para JPEG
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        
        ctx.drawImage(img, 0, 0, width, height);

        // Exporta como JPEG otimizado
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error('Falha ao comprimir imagem.'));
            }
            // Recria o File object preservando o nome original mudando a extensão
            const originalName = file.name || 'photo.jpg';
            const lastDot = originalName.lastIndexOf('.');
            const nameBase = lastDot !== -1 ? originalName.substring(0, lastDot) : originalName;
            const newName = `${nameBase}.jpg`;
            
            const compressedFile = new File([blob], newName, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      
      img.src = event.target.result;
    };

    reader.readAsDataURL(file);
  });
};
