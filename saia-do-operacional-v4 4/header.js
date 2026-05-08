// ============================================================
// HEADER COMPARTILHADO :: páginas autenticadas
// Renderiza o header com navegação, user-chip, logout
// ============================================================

window.renderHeader = async function(activePage) {
  const slot = document.getElementById('headerSlot');
  if (!slot) return;

  const perfil = await window.AppAuth.getPerfil();
  const isAdmin = perfil && perfil.is_admin;
  const nome = perfil ? perfil.nome : '';
  const initial = nome ? nome.trim()[0].toUpperCase() : '?';

  slot.innerHTML = `
    <header class="top">
      <div class="container top-inner">
        <a href="app.html" class="brand-mark">Implementare</a>
        <nav class="top-nav">
          <a href="app.html" class="${activePage === 'app' ? 'active' : ''}">Ferramenta</a>
          <a href="gestao.html" class="${activePage === 'gestao' ? 'active' : ''}">Gestão diária</a>
          ${isAdmin ? `<a href="admin.html" class="${activePage === 'admin' ? 'active' : ''}">Admin</a>` : ''}
        </nav>
        <div class="top-actions">
          <span class="saved-indicator" id="savedIndicator">salvo</span>
          <div class="user-chip">
            <span class="user-avatar">${initial}</span>
            <span>${escapeHtml(nome)}</span>
          </div>
          <button class="btn btn-ghost" onclick="window.AppAuth.signOut()" title="Sair">
            ${window.Icons.logout} sair
          </button>
        </div>
      </div>
    </header>
  `;
};

function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
