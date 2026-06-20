// ============================================
// Toast notification utility
// ============================================

let toastContainer = null;

function ensureContainer() {
    if (toastContainer) return toastContainer;
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
    return toastContainer;
}

const ICONS = { success: '✅', danger: '⚠️', info: 'ℹ️', warning: '⚡' };

export function showToast(title, message, type = 'info') {
    const container = ensureContainer();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} anim-slide-up`;
    toast.innerHTML = `
    <div class="toast-icon">${ICONS[type] ?? ICONS.info}</div>
    <div class="toast-body">
      <div class="toast-title">${title}</div>
      <div class="toast-msg">${message}</div>
    </div>
    <button class="toast-close">✕</button>
  `;

    toast.querySelector('.toast-close').addEventListener('click', () => toast.remove());
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('toast-out');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}
