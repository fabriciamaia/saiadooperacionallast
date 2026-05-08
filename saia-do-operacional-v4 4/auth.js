// ============================================================
// AUTH + DB :: módulo compartilhado
// Carrega o cliente Supabase, oferece funções de login/cadastro,
// proteção de rota e CRUD do estado da ferramenta.
// ============================================================

(function() {
  // checa configuração antes de qualquer coisa
  if (!window.SUPABASE_CONFIG || window.SUPABASE_CONFIG.url === 'COLE_AQUI_SUA_URL') {
    console.error('[Saia do Operacional] Supabase não configurado. Edite supabase-config.js');
    document.addEventListener('DOMContentLoaded', () => {
      const banner = document.createElement('div');
      banner.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#c63939;color:#fff;padding:12px;text-align:center;z-index:99999;font-family:sans-serif;font-size:14px;';
      banner.innerHTML = '⚠️ Supabase não configurado. Edite o arquivo <strong>supabase-config.js</strong> com as chaves do seu projeto.';
      document.body.appendChild(banner);
    });
    return;
  }

  // cria cliente
  const { url, anonKey } = window.SUPABASE_CONFIG;
  const supabase = window.supabase.createClient(url, anonKey);

  // ===== AUTH =====
  async function getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) { console.error('getSession:', error); return null; }
    return data.session;
  }

  async function getUser() {
    const session = await getSession();
    return session ? session.user : null;
  }

  async function getPerfil() {
    const user = await getUser();
    if (!user) return null;
    const { data, error } = await supabase
      .from('perfis')
      .select('*')
      .eq('id', user.id)
      .single();
    if (error) { console.error('getPerfil:', error); return null; }
    return data;
  }

  async function signUp(email, password, nome, especialidade) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nome, especialidade }
      }
    });
    return { data, error };
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      window.location.href = 'index.html';
    }
    return { error };
  }

  async function resetPassword(email) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/redefinir-senha.html'
    });
    return { data, error };
  }

  // proteger uma página: redireciona pra login se não logado
  async function requireAuth() {
    const session = await getSession();
    if (!session) {
      window.location.href = 'index.html';
      return null;
    }
    return session;
  }

  // proteger página admin
  async function requireAdmin() {
    const session = await requireAuth();
    if (!session) return null;
    const perfil = await getPerfil();
    if (!perfil || !perfil.is_admin) {
      alert('Acesso restrito.');
      window.location.href = 'app.html';
      return null;
    }
    return { session, perfil };
  }

  // ===== ESTADO DA FERRAMENTA =====
  async function carregarEstado() {
    const user = await getUser();
    if (!user) return null;
    const { data, error } = await supabase
      .from('estado_ferramenta')
      .select('estado')
      .eq('user_id', user.id)
      .single();
    if (error) {
      // se não existe ainda, cria com default
      if (error.code === 'PGRST116') {
        await supabase.from('estado_ferramenta').insert({ user_id: user.id });
        return { rows: [], selectedArea: '', areasFinalizadas: [] };
      }
      console.error('carregarEstado:', error);
      return null;
    }
    return data.estado;
  }

  let saveTimer = null;
  async function salvarEstado(estado, callback) {
    const user = await getUser();
    if (!user) { if (callback) callback(false); return; }
    // debounce de 500ms
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      const { error } = await supabase
        .from('estado_ferramenta')
        .upsert({
          user_id: user.id,
          estado: estado,
          atualizado_em: new Date().toISOString()
        }, { onConflict: 'user_id' });
      if (error) console.error('[Saia] salvarEstado erro:', error);
      else console.log('[Saia] estado salvo no Supabase');
      if (callback) callback(!error);
    }, 500);
  }

  // SEM debounce :: usado em transições de etapa
  async function salvarEstadoAgora(estado) {
    const user = await getUser();
    if (!user) return false;
    clearTimeout(saveTimer); // cancela debounce pendente
    const { error } = await supabase
      .from('estado_ferramenta')
      .upsert({
        user_id: user.id,
        estado: estado,
        atualizado_em: new Date().toISOString()
      }, { onConflict: 'user_id' });
    if (error) console.error('[Saia] salvarEstadoAgora erro:', error);
    else console.log('[Saia] estado salvo IMEDIATO no Supabase');
    return !error;
  }

  // ===== LOG DE ACOMPANHAMENTO =====
  async function listarLogs(rowId) {
    const user = await getUser();
    if (!user) return [];
    let query = supabase
      .from('log_acompanhamento')
      .select('*')
      .eq('user_id', user.id)
      .order('criado_em', { ascending: false });
    if (rowId) query = query.eq('row_id', rowId);
    const { data, error } = await query;
    if (error) { console.error('listarLogs:', error); return []; }
    return data || [];
  }

  async function adicionarLog(rowId, status, observacao) {
    const user = await getUser();
    if (!user) return null;
    const { data, error } = await supabase
      .from('log_acompanhamento')
      .insert({
        user_id: user.id,
        row_id: rowId,
        status: status,
        observacao: observacao
      })
      .select()
      .single();
    if (error) { console.error('adicionarLog:', error); return null; }
    return data;
  }

  async function removerLog(logId) {
    const { error } = await supabase
      .from('log_acompanhamento')
      .delete()
      .eq('id', logId);
    return !error;
  }

  // ===== ADMIN =====
  async function adminListarUsuarias() {
    const { data, error } = await supabase
      .from('perfis')
      .select('*')
      .order('criado_em', { ascending: false });
    if (error) { console.error('adminListarUsuarias:', error); return []; }
    return data || [];
  }

  async function adminCarregarEstadoUsuaria(userId) {
    const { data, error } = await supabase
      .from('estado_ferramenta')
      .select('estado, atualizado_em')
      .eq('user_id', userId)
      .single();
    if (error) { console.error('adminCarregarEstado:', error); return null; }
    return data;
  }

  async function adminAtualizarFase(userId, fase) {
    const { error } = await supabase
      .from('perfis')
      .update({ fase: fase, atualizado_em: new Date().toISOString() })
      .eq('id', userId);
    return !error;
  }

  // expõe global
  window.AppAuth = {
    supabase, getSession, getUser, getPerfil,
    signUp, signIn, signOut, resetPassword,
    requireAuth, requireAdmin,
    carregarEstado, salvarEstado, salvarEstadoAgora,
    listarLogs, adicionarLog, removerLog,
    adminListarUsuarias, adminCarregarEstadoUsuaria, adminAtualizarFase
  };
})();
