// ============================================
// App shell — sidebar, header, nav routing
// ============================================

export function buildShell(container, { role, user, navItems, activeItem, pageTitle, pageSubtitle, bodyHTML }) {
    const roleLabels = { teacher: 'ครู', parent: 'ผู้ปกครอง', student: 'นักเรียน', expert: 'ผู้เชี่ยวชาญ' };

    container.innerHTML = `
    <div class="app-layout">
      <aside class="sidebar">
        <div class="sidebar-brand">
          <img class="brand-logo" src="./assets/dek-all-logo.png" alt="Dek All logo" />
          <div>
            <div class="brand-name">Dek All</div>
            <div class="brand-role">${roleLabels[role] ?? role}</div>
          </div>
        </div>
        <nav class="sidebar-nav">
          ${navItems.map(item => {
            if (item.section) return `<div class="nav-section">${item.section}</div>`;
            const active = item.id === activeItem ? ' active' : '';
            const badge = item.badge != null
                ? `<span class="nav-badge">${item.badge}</span>`
                : '';
            return `
              <button class="nav-item${active}" data-nav="${item.id}">
                <span class="nav-icon">${item.icon}</span>
                <span class="nav-label">${item.label}</span>
                ${badge}
              </button>
            `;
          }).join('')}
        </nav>
        <div class="sidebar-footer">
          <div class="sidebar-user">
            <div class="avatar avatar-sm">${user.avatar ?? '👤'}</div>
            <div class="sidebar-user-info">
              <div class="sidebar-user-name">${user.name}</div>
              <div class="sidebar-user-role">${roleLabels[role]}</div>
            </div>
          </div>
          <button class="sidebar-logout" id="logoutBtn" type="button">
            <span>↪</span> ออกจากระบบ
          </button>
        </div>
      </aside>
      <main class="main-content">
        <header class="page-header">
          <div>
            <h1 class="page-title">${pageTitle}</h1>
            <p class="page-subtitle">${pageSubtitle}</p>
          </div>
        </header>
        <div class="page-body">${bodyHTML}</div>
      </main>
    </div>
  `;

    container.querySelectorAll('[data-nav]').forEach(btn => {
        btn.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('dekall-navigate', { detail: btn.dataset.nav }));
        });
    });

    container.querySelector('#logoutBtn')?.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('dekall-logout'));
    });
}
