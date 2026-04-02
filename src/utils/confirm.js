export const confirmDialog = (title, message, confirmText = 'Confirmar', cancelText = 'Cancelar') => {
  return new Promise((resolve) => {
    const event = new CustomEvent('app-confirm', {
      detail: {
        title,
        message,
        confirmText,
        cancelText,
        onResolve: resolve
      }
    });
    window.dispatchEvent(event);
  });
};
