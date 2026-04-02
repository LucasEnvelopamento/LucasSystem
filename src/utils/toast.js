export const toast = {
  success: (message) => triggerToast(message, 'success'),
  error: (message) => triggerToast(message, 'error'),
  info: (message) => triggerToast(message, 'info'),
  warning: (message) => triggerToast(message, 'warning'),
};

const triggerToast = (message, type) => {
  const event = new CustomEvent('app-toast', { detail: { id: Date.now().toString() + Math.random().toString(), message, type } });
  window.dispatchEvent(event);
};
