// ============================================================
// SAIA DO OPERACIONAL :: APP.JS
// Lógica completa da ferramenta de 5 etapas
// ============================================================

let state = {
  rows: [],
  selectedArea: '',
  selectedICP: '',
  areasFinalizadas: []
};

const FREQ_OPTIONS = ['Diário', 'A cada 2 dias', 'Semanal', 'Quinzenal', 'Mensal', 'Conforme demanda'];
const PRIO_OPTIONS = ['Alta', 'Média', 'Baixa'];
// Profissões (não setores). Recepcionista (não Recepção). Adicionada Secretária.
const QUEM_OPTIONS = ['Eu', 'Recepcionista', 'Secretária', 'Enfermeira', 'Técnica de enfermagem', 'Auxiliar', 'Sócia(o)', 'Gerente', 'Ninguém ainda', 'Outro'];

// ===== ÁREAS =====
const AREAS = [
  {
    id: 'atendimento',
    name: 'Atendimento & Recepção',
    icon: 'phone',
    desc: 'Tudo que envolve a paciente antes, durante e depois da consulta. Agenda, recepção, pós-atendimento.',
    meta: 'O que mais consome o dia a dia',
    defaultPilar: 'Operacional'
  },
  {
    id: 'comercial',
    name: 'Comercial',
    icon: 'briefcase',
    desc: 'Orçamento, fechamento de protocolo, cobrança, follow-up. O caixa entra ou trava aqui.',
    meta: 'O que define o faturamento',
    defaultPilar: 'Tático'
  },
  {
    id: 'marketing',
    name: 'Marketing & Conteúdo',
    icon: 'device',
    desc: 'Instagram, conteúdo, captação de paciente nova, indicações, parcerias.',
    meta: 'Onde a paciente nova chega',
    defaultPilar: 'Tático'
  },
  {
    id: 'clinico',
    name: 'Clínico & Profissional',
    icon: 'stethoscope',
    desc: 'Atendimento clínico, prontuário, evolução, congresso, formação. O que só você faz.',
    meta: 'Sua mão indelegável',
    defaultPilar: 'Estratégico'
  },
  {
    id: 'gestao',
    name: 'Gestão',
    icon: 'chart',
    desc: 'Financeiro, equipe, fornecedores, números do mês, reuniões, planejamento.',
    meta: 'O que sustenta a operação',
    defaultPilar: 'Estratégico'
  }
];

// ===== CATÁLOGO :: 54 atividades pré-definidas =====
const CATALOG = {
  atendimento: [
    {
      macro: 'Agenda',
      macroDesc: 'Tudo que envolve marcar, confirmar e reorganizar consulta',
      micros: [
        { texto: 'Confirmar consultas do dia seguinte por WhatsApp', pilar: 'Operacional', freq: 'Diário', tempo: '30min', delegavel: true },
        { texto: 'Reorganizar agenda quando paciente cancela ou remarca', pilar: 'Operacional', freq: 'Diário', tempo: '15min', delegavel: true },
        { texto: 'Encaixar pacientes urgentes na agenda', pilar: 'Tático', freq: 'Diário', tempo: '15min', delegavel: false },
        { texto: 'Fechar agenda da semana com horários disponíveis', pilar: 'Tático', freq: 'Semanal', tempo: '30min', delegavel: true }
      ]
    },
    {
      macro: 'Recepção da paciente',
      macroDesc: 'O que acontece quando ela chega no consultório',
      micros: [
        { texto: 'Receber a paciente, atualizar dados de cadastro', pilar: 'Operacional', freq: 'Diário', tempo: '10min', delegavel: true },
        { texto: 'Conferir documentação e exames antes da consulta', pilar: 'Operacional', freq: 'Diário', tempo: '10min', delegavel: true },
        { texto: 'Apresentar o consultório para paciente nova (tour, café, ambiente)', pilar: 'Tático', freq: 'Semanal', tempo: '15min', delegavel: true }
      ]
    },
    {
      macro: 'Pós-consulta',
      macroDesc: 'O que acontece depois que a paciente sai da sala',
      micros: [
        { texto: 'Mandar mensagem de pós-atendimento (cuidados, dúvidas)', pilar: 'Tático', freq: 'Diário', tempo: '20min', delegavel: true },
        { texto: 'Agendar retorno ou próxima sessão', pilar: 'Operacional', freq: 'Diário', tempo: '10min', delegavel: true },
        { texto: 'Enviar receituário ou solicitação de exame por email', pilar: 'Operacional', freq: 'Diário', tempo: '10min', delegavel: true },
        { texto: 'Pedir avaliação no Google ou Doctoralia', pilar: 'Tático', freq: 'Semanal', tempo: '15min', delegavel: true }
      ]
    }
  ],
  comercial: [
    {
      macro: 'Orçamento de protocolo',
      macroDesc: 'Da apresentação do protocolo ao envio do valor',
      micros: [
        { texto: 'Apresentar o protocolo para a paciente na consulta', pilar: 'Estratégico', freq: 'Semanal', tempo: '20min', delegavel: false },
        { texto: 'Preparar orçamento com valores, formas de pagamento e descontos', pilar: 'Operacional', freq: 'Semanal', tempo: '30min', delegavel: true },
        { texto: 'Enviar orçamento por WhatsApp ou email', pilar: 'Operacional', freq: 'Semanal', tempo: '10min', delegavel: true }
      ]
    },
    {
      macro: 'Fechamento e follow-up',
      macroDesc: 'Quando a paciente recebe o orçamento e até decidir',
      micros: [
        { texto: 'Fazer follow-up com paciente que recebeu orçamento (1-2 dias depois)', pilar: 'Tático', freq: 'Semanal', tempo: '30min', delegavel: true },
        { texto: 'Negociar condições, descontos ou parcelamento', pilar: 'Tático', freq: 'Semanal', tempo: '20min', delegavel: false },
        { texto: 'Responder objeções da paciente sobre preço ou prazo', pilar: 'Tático', freq: 'Semanal', tempo: '20min', delegavel: false },
        { texto: 'Formalizar contrato de protocolo e termo de consentimento', pilar: 'Operacional', freq: 'Semanal', tempo: '20min', delegavel: true }
      ]
    },
    {
      macro: 'Cobrança',
      macroDesc: 'Garantir que o que foi vendido é pago',
      micros: [
        { texto: 'Conferir pagamentos recebidos do dia', pilar: 'Operacional', freq: 'Diário', tempo: '15min', delegavel: true },
        { texto: 'Mandar lembrete de parcela vencendo', pilar: 'Operacional', freq: 'Semanal', tempo: '20min', delegavel: true },
        { texto: 'Cobrar inadimplência ativamente', pilar: 'Tático', freq: 'Semanal', tempo: '30min', delegavel: true }
      ]
    }
  ],
  marketing: [
    {
      macro: 'Instagram',
      macroDesc: 'Conteúdo, presença, audiência',
      micros: [
        { texto: 'Pensar pauta da semana de Instagram (posts e Reels)', pilar: 'Tático', freq: 'Semanal', tempo: '1h', delegavel: false },
        { texto: 'Gravar Reels e fotos para o feed', pilar: 'Operacional', freq: 'Semanal', tempo: '1h', delegavel: false },
        { texto: 'Editar vídeo, fazer card, escrever legenda', pilar: 'Operacional', freq: 'Semanal', tempo: '2h', delegavel: true },
        { texto: 'Postar no horário certo e responder comentários', pilar: 'Operacional', freq: 'Diário', tempo: '20min', delegavel: true },
        { texto: 'Responder DMs, qualificar lead que chegou pelo Instagram', pilar: 'Tático', freq: 'Diário', tempo: '30min', delegavel: true }
      ]
    },
    {
      macro: 'Captação',
      macroDesc: 'Como paciente nova chega no consultório',
      micros: [
        { texto: 'Acompanhar tráfego pago se tiver (anúncios, métricas)', pilar: 'Tático', freq: 'Semanal', tempo: '30min', delegavel: true },
        { texto: 'Pedir indicação para paciente que terminou protocolo', pilar: 'Tático', freq: 'Semanal', tempo: '15min', delegavel: false },
        { texto: 'Atender lead que chegou por indicação ou Google', pilar: 'Tático', freq: 'Diário', tempo: '20min', delegavel: true }
      ]
    },
    {
      macro: 'Parcerias e eventos',
      macroDesc: 'Tudo que coloca o consultório em contato com público novo',
      micros: [
        { texto: 'Conversar com parceiro estratégico (médica de outra especialidade, esteticista parceira)', pilar: 'Estratégico', freq: 'Mensal', tempo: '1h', delegavel: false },
        { texto: 'Organizar evento no consultório (open house, palestra, drink)', pilar: 'Tático', freq: 'Mensal', tempo: '3h', delegavel: true }
      ]
    }
  ],
  clinico: [
    {
      macro: 'Atendimento',
      macroDesc: 'O encontro com a paciente',
      micros: [
        { texto: 'Atender consulta clínica', pilar: 'Estratégico', freq: 'Diário', tempo: '4h', delegavel: false },
        { texto: 'Realizar procedimento (preenchimento, toxina, harmonização etc)', pilar: 'Estratégico', freq: 'Semanal', tempo: '2h', delegavel: false },
        { texto: 'Avaliar caso e definir protocolo personalizado', pilar: 'Estratégico', freq: 'Semanal', tempo: '1h', delegavel: false }
      ]
    },
    {
      macro: 'Prontuário e evolução',
      macroDesc: 'Registro do atendimento',
      micros: [
        { texto: 'Escrever evolução no prontuário depois da consulta', pilar: 'Operacional', freq: 'Diário', tempo: '30min', delegavel: false },
        { texto: 'Tirar e organizar fotos clínicas (antes/depois)', pilar: 'Operacional', freq: 'Semanal', tempo: '30min', delegavel: true },
        { texto: 'Conferir prontuário antes da próxima consulta', pilar: 'Operacional', freq: 'Diário', tempo: '20min', delegavel: false }
      ]
    },
    {
      macro: 'Formação contínua',
      macroDesc: 'Estudo, congresso, atualização',
      micros: [
        { texto: 'Estudar caso clínico complexo, buscar literatura', pilar: 'Estratégico', freq: 'Semanal', tempo: '2h', delegavel: false },
        { texto: 'Participar de congresso ou curso de especialização', pilar: 'Estratégico', freq: 'Mensal', tempo: '8h', delegavel: false },
        { texto: 'Participar de grupo de discussão clínica', pilar: 'Tático', freq: 'Mensal', tempo: '2h', delegavel: false }
      ]
    }
  ],
  gestao: [
    {
      macro: 'Financeiro',
      macroDesc: 'Os números do consultório',
      micros: [
        { texto: 'Olhar fechamento do dia (caixa, recebimentos)', pilar: 'Tático', freq: 'Diário', tempo: '15min', delegavel: true },
        { texto: 'Olhar fluxo de caixa e contas a pagar/receber da semana', pilar: 'Tático', freq: 'Semanal', tempo: '1h', delegavel: false },
        { texto: 'Fechamento mensal: olhar números, decidir próximo passo', pilar: 'Estratégico', freq: 'Mensal', tempo: '2h', delegavel: false },
        { texto: 'Conversar com contadora sobre impostos, balanço, nota fiscal', pilar: 'Tático', freq: 'Mensal', tempo: '1h', delegavel: false }
      ]
    },
    {
      macro: 'Equipe',
      macroDesc: 'Pessoas que tocam o consultório com você',
      micros: [
        { texto: 'Reunião semanal com a equipe (alinhamento)', pilar: 'Tático', freq: 'Semanal', tempo: '1h', delegavel: false },
        { texto: 'Dar feedback individual para alguém da equipe', pilar: 'Tático', freq: 'Mensal', tempo: '30min', delegavel: false },
        { texto: 'Resolver problema interno (conflito, atraso, falta)', pilar: 'Operacional', freq: 'Conforme demanda', tempo: '30min', delegavel: false },
        { texto: 'Treinar pessoa nova ou reciclar processo', pilar: 'Tático', freq: 'Mensal', tempo: '2h', delegavel: false }
      ]
    },
    {
      macro: 'Fornecedores e estoque',
      macroDesc: 'Materiais e parcerias operacionais',
      micros: [
        { texto: 'Comprar material clínico, comparar fornecedor', pilar: 'Operacional', freq: 'Mensal', tempo: '1h', delegavel: true },
        { texto: 'Conferir estoque do mês (toxina, fios, anestésicos etc)', pilar: 'Operacional', freq: 'Semanal', tempo: '30min', delegavel: true },
        { texto: 'Negociar com fornecedor (preço, prazo, condição)', pilar: 'Tático', freq: 'Mensal', tempo: '1h', delegavel: false }
      ]
    },
    {
      macro: 'Planejamento',
      macroDesc: 'Pensar o futuro do consultório',
      micros: [
        { texto: 'Olhar metas do trimestre e o que está fora do trilho', pilar: 'Estratégico', freq: 'Mensal', tempo: '2h', delegavel: false },
        { texto: 'Pensar nova frente, nova oferta, novo serviço', pilar: 'Estratégico', freq: 'Mensal', tempo: '2h', delegavel: false },
        { texto: 'Decidir investimento (equipamento, contratação, reforma)', pilar: 'Estratégico', freq: 'Mensal', tempo: '1h', delegavel: false }
      ]
    }
  ]
};

const ICP_HINTS = {
  expansao: { delegueMais: 'Você já tem time. Tudo que parece operacional repetitivo deveria estar delegado.' },
  evolucao: { delegueMais: 'Você geralmente faz quase tudo sozinha ou com 1 ajudante. Foque em tirar das suas mãos o que é claramente operacional repetido.' },
  'nova-fase': { delegueMais: 'Você frequentemente trabalha em coworking ou consultório enxuto. Aqui o foco é mapear, não delegar tudo agora. Delegação vem quando o caixa permite.' }
};

function newRow(data) {
  data = data || {};
  return {
    id: data.id || ('r' + Date.now() + Math.random().toString(36).slice(2, 7)),
    pilar: data.pilar || '',
    area: data.area || '',
    macro: data.macro || '',
    micro: data.micro || '',
    quemFaz: data.quemFaz || '',
    freq: data.freq || '',
    tempo: data.tempo || '',
    prioridade: data.prioridade || '',
    delegar: !!data.delegar,
    fromCatalog: data.fromCatalog || '',
    // PLAN FASE 0 :: já tem processo desenhado?
    jaTemProcesso: data.jaTemProcesso || '', // 'sim' | 'nao' | ''
    linkProcessoExistente: data.linkProcessoExistente || '',
    // PLAN FASE 1 :: definir processo (só se não tem)
    quemDesenha: data.quemDesenha || '',
    comoDesenhar: data.comoDesenhar || '',
    como: data.como || '',
    linkProcesso: data.linkProcesso || '',
    dataConclusao: data.dataConclusao || '',
    statusProcesso: data.statusProcesso || '',
    // PLAN FASE 2 :: começar
    startComo: data.startComo || '',
    dataStart: data.dataStart || '',
    praQuem: data.praQuem || '',
    statusStart: data.statusStart || '',
    // PLAN FASE 3 :: acompanhar 30d
    ferramentaGestao: data.ferramentaGestao || '',
    formaAcompanhamento: data.formaAcompanhamento || '',
    resultados30d: data.resultados30d || '',
    ajusteNecessario: data.ajusteNecessario || ''
  };
}

// ===== STATE PERSIST =====
// save() :: usar para digitação contínua (oninput em texto). Tem debounce.
async function save() {
  showSaveIndicator('salvando');
  await window.AppAuth.salvarEstado(state, (ok) => {
    showSaveIndicator(ok ? 'salvo' : 'erro');
  });
}

// saveNow() :: usar para eventos pontuais (clique, checkbox, select, mover, remover).
// Salva imediato sem debounce.
async function saveNow() {
  showSaveIndicator('salvando');
  try {
    let ok;
    // fallback caso o auth.js antigo ainda esteja em cache (sem salvarEstadoAgora)
    if (typeof window.AppAuth.salvarEstadoAgora === 'function') {
      ok = await window.AppAuth.salvarEstadoAgora(state);
    } else {
      console.warn('[Saia] salvarEstadoAgora indisponível, usando fallback com debounce');
      ok = await new Promise(resolve => {
        window.AppAuth.salvarEstado(state, (r) => resolve(r));
      });
    }
    showSaveIndicator(ok ? 'salvo' : 'erro');
    return ok;
  } catch (e) {
    showSaveIndicator('erro');
    console.error('[Saia] saveNow falhou:', e);
    return false;
  }
}

function showSaveIndicator(estado) {
  const ind = document.getElementById('savedIndicator');
  if (!ind) return;
  ind.classList.remove('error', 'saving');
  if (estado === 'salvando') {
    ind.textContent = 'salvando';
    ind.classList.add('saving', 'visible');
    clearTimeout(showSaveIndicator._t);
  } else if (estado === 'salvo') {
    ind.textContent = 'tudo salvo';
    ind.classList.add('visible');
    clearTimeout(showSaveIndicator._t);
    showSaveIndicator._t = setTimeout(() => ind.classList.remove('visible'), 2000);
  } else if (estado === 'erro') {
    ind.textContent = 'erro ao salvar';
    ind.classList.add('error', 'visible');
    clearTimeout(showSaveIndicator._t);
    showSaveIndicator._t = setTimeout(() => ind.classList.remove('visible'), 5000);
  }
}

async function loadState() {
  const data = await window.AppAuth.carregarEstado();
  if (data) {
    state = {
      rows: (data.rows || []).map(r => newRow(r)),
      selectedArea: data.selectedArea || '',
      selectedICP: data.selectedICP || '',
      areasFinalizadas: data.areasFinalizadas || []
    };
  }
}

// ===== ICONS BOOT =====
function bootIcons() {
  const map = {
    iconNext1: window.Icons.arrowRight,
    iconNext2: window.Icons.arrowRight,
    iconNext3: window.Icons.arrowRight,
    iconNext4: window.Icons.arrowRight,
    iconBack2: window.Icons.arrowLeft,
    iconBack3: window.Icons.arrowLeft,
    iconBack4: window.Icons.arrowLeft,
    iconBack5: window.Icons.arrowLeft,
    iconBackSm: window.Icons.arrowLeft,
    iconPlus: window.Icons.plus,
    iconPlus2: window.Icons.plus,
    iconPrint: window.Icons.print,
    iconExcel: window.Icons.download,
    iconGestao: window.Icons.arrowRight
  };
  Object.entries(map).forEach(([id, html]) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  });
}

// ===== STEP NAV =====
async function goStep(n) {
  // Salva o estado IMEDIATO no Supabase antes de qualquer transição
  // pra garantir que nada que você digitou se perde
  try {
    if (typeof window.AppAuth.salvarEstadoAgora === 'function') {
      await window.AppAuth.salvarEstadoAgora(state);
    } else {
      // fallback: força resolução do save com debounce
      await new Promise(resolve => window.AppAuth.salvarEstado(state, resolve));
    }
  } catch (e) {
    console.error('[Saia] erro ao salvar antes de trocar de etapa:', e);
  }

  document.querySelectorAll('.step-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.step-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('step-' + n).classList.add('active');
  const target = document.querySelector('.step-btn[data-step="' + n + '"]');
  if (target) target.classList.add('active');

  document.querySelectorAll('.step-btn').forEach(b => {
    const s = parseInt(b.dataset.step);
    if (s < n) b.classList.add('done');
    else if (s === n) b.classList.remove('done');
  });

  if (n === 2) renderAreas();
  if (n === 3) { renderCatalog(); renderDespejo(); renderConcludeArea(); }
  if (n === 4) renderSummary();
  if (n === 5) renderPlano();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== ETAPA 2 :: ÁREAS =====
function renderAreas() {
  const grid = document.getElementById('areasGrid');
  grid.innerHTML = AREAS.map(a => {
    const isCompleted = state.areasFinalizadas.includes(a.id);
    const isSelected = state.selectedArea === a.id;
    const completedBadge = isCompleted ? `<div class="area-completed-badge">${window.Icons.check} concluída</div>` : '';
    return `
      <div class="area-card ${a.id} ${isSelected ? 'selected' : ''} ${isCompleted ? 'completed' : ''}" onclick="selectArea('${a.id}')">
        ${completedBadge}
        <div class="area-icon">${window.Icons[a.icon]}</div>
        <div class="area-name">${a.name}</div>
        <div class="area-desc">${a.desc}</div>
        <div class="area-meta">${a.meta}</div>
      </div>
    `;
  }).join('');

  // ICP pills
  document.querySelectorAll('.icp-pill').forEach(p => {
    if (p.dataset.icp === state.selectedICP) p.classList.add('active');
    else p.classList.remove('active');
  });

  // progresso
  const prog = document.getElementById('progressoAreas');
  if (state.areasFinalizadas.length === 0) {
    prog.innerHTML = '<span style="color: var(--ink-muted);">Nenhuma área concluída ainda. Comece pela que mais consome seu tempo hoje.</span>';
  } else {
    const pills = state.areasFinalizadas.map(id => {
      const a = AREAS.find(x => x.id === id);
      return a ? `<span class="progresso-pill">${window.Icons.circleCheck} ${a.name}</span>` : '';
    }).join('');
    prog.innerHTML = `<strong style="color:var(--teal-dark);font-family:Fraunces,serif;">Áreas concluídas:</strong> ${pills}`;
  }
}

function selectArea(id) {
  state.selectedArea = id;
  renderAreas();
  saveNow();
}

function selectICP(id) {
  state.selectedICP = id;
  renderAreas();
  saveNow();
}

// ===== ETAPA 3 :: CATÁLOGO =====
function renderCatalog() {
  const cont = document.getElementById('catalogContainer');
  if (!state.selectedArea) {
    cont.innerHTML = `
      <div class="empty-state" style="margin-bottom: 24px;">
        <strong>Você ainda não escolheu uma área.</strong>
        <p>Volta na etapa 2 e escolhe por onde começar.</p>
        <p style="margin-top: 12px;"><button class="btn" onclick="goStep(2)">${window.Icons.arrowLeft} ir para etapa 2</button></p>
      </div>`;
    return;
  }

  const area = AREAS.find(a => a.id === state.selectedArea);
  const catalog = CATALOG[state.selectedArea] || [];
  const addedKeys = new Set(state.rows.filter(r => r.fromCatalog).map(r => r.fromCatalog));

  let icpHint = '';
  if (state.selectedICP && ICP_HINTS[state.selectedICP]) {
    icpHint = `<div class="insight-box" style="margin-bottom:20px;"><strong>Dica para sua fase:</strong> ${ICP_HINTS[state.selectedICP].delegueMais}</div>`;
  }

  // Mapeia áreas para variáveis CSS
  const accentMap = {
    atendimento: { color: 'var(--teal)', soft: 'var(--teal-soft)' },
    comercial: { color: 'var(--terracotta)', soft: 'var(--terracotta-soft)' },
    marketing: { color: 'var(--orange)', soft: 'var(--orange-soft)' },
    clinico: { color: 'var(--lime)', soft: 'var(--lime-soft)' },
    gestao: { color: 'var(--plum)', soft: 'var(--plum-soft)' }
  };
  const acc = accentMap[state.selectedArea] || accentMap.atendimento;

  cont.innerHTML = icpHint + `
    <div class="catalog-section" style="--accent: ${acc.color}; --accent-soft: ${acc.soft};">
      <div class="catalog-head">
        <div class="catalog-icon">${window.Icons[area.icon]}</div>
        <div class="catalog-title-block">
          <div class="catalog-title">${area.name}</div>
          <div class="catalog-subtitle">Marque as atividades que você faz hoje. Pode adicionar coisas que faltaram depois.</div>
        </div>
      </div>
      ${catalog.map(macroBlock => `
        <div class="catalog-macro">
          <div class="catalog-macro-title">${escapeHtml(macroBlock.macro)}</div>
          <div class="catalog-macro-desc">${escapeHtml(macroBlock.macroDesc)}</div>
          <div class="catalog-micro-list">
            ${macroBlock.micros.map((m, i) => {
              const key = `${state.selectedArea}::${macroBlock.macro}::${i}`;
              const isAdded = addedKeys.has(key);
              return `
                <div class="catalog-micro-item ${isAdded ? 'added' : ''}" onclick="addFromCatalog('${state.selectedArea}', ${escapeJs(macroBlock.macro)}, ${i})">
                  <div class="catalog-micro-check">${isAdded ? window.Icons.check : ''}</div>
                  <div class="catalog-micro-text">${escapeHtml(m.texto)}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `).join('')}
      <div class="catalog-bulk">
        <button class="btn" onclick="addAllFromArea('${state.selectedArea}')">${window.Icons.plus} Adicionar todas dessa área</button>
        <button class="btn btn-ghost" onclick="goStep(2)">${window.Icons.arrowLeft} trocar área</button>
      </div>
    </div>
  `;
}

function renderConcludeArea() {
  const slot = document.getElementById('concludeAreaSlot');
  if (!slot) return;
  if (!state.selectedArea) { slot.innerHTML = ''; return; }
  if (state.areasFinalizadas.includes(state.selectedArea)) { slot.innerHTML = ''; return; }

  const area = AREAS.find(a => a.id === state.selectedArea);
  const rowsArea = state.rows.filter(r => r.fromCatalog && r.fromCatalog.startsWith(state.selectedArea + '::'));
  if (rowsArea.length === 0) { slot.innerHTML = ''; return; }

  slot.innerHTML = `
    <div class="conclude-area-card">
      <div>
        <div class="conclude-text">Concluiu de mapear ${area.name.toLowerCase()}?</div>
        <div class="conclude-sub">Marca como concluída e volta na etapa 2 para escolher outra área. Você pode voltar e mexer depois.</div>
      </div>
      <button class="btn btn-primary" onclick="concludeArea()">${window.Icons.check} Concluí esta área, próxima</button>
    </div>
  `;
}

function concludeArea() {
  if (state.selectedArea && !state.areasFinalizadas.includes(state.selectedArea)) {
    state.areasFinalizadas.push(state.selectedArea);
  }
  state.selectedArea = '';
  saveNow(); // salva ANTES de transição
  goStep(2);
}

function addFromCatalog(areaId, macroName, microIdx) {
  const macroBlock = (CATALOG[areaId] || []).find(m => m.macro === macroName);
  if (!macroBlock) return;
  const m = macroBlock.micros[microIdx];
  if (!m) return;

  const key = `${areaId}::${macroName}::${microIdx}`;
  const existing = state.rows.find(r => r.fromCatalog === key);
  if (existing) {
    state.rows = state.rows.filter(r => r.fromCatalog !== key);
  } else {
    const area = AREAS.find(a => a.id === areaId);
    state.rows.push(newRow({
      pilar: m.pilar,
      area: area ? area.name : '',
      macro: macroName,
      micro: m.texto,
      freq: m.freq || '',
      tempo: m.tempo || '',
      prioridade: m.delegavel ? 'Alta' : 'Média',
      delegar: !!m.delegavel,
      fromCatalog: key
    }));
  }
  renderCatalog();
  renderDespejo();
  renderConcludeArea();
  saveNow();
}

function addAllFromArea(areaId) {
  const catalog = CATALOG[areaId] || [];
  const addedKeys = new Set(state.rows.filter(r => r.fromCatalog).map(r => r.fromCatalog));
  const area = AREAS.find(a => a.id === areaId);
  catalog.forEach(macroBlock => {
    macroBlock.micros.forEach((m, i) => {
      const key = `${areaId}::${macroBlock.macro}::${i}`;
      if (!addedKeys.has(key)) {
        state.rows.push(newRow({
          pilar: m.pilar,
          area: area ? area.name : '',
          macro: macroBlock.macro,
          micro: m.texto,
          freq: m.freq || '',
          tempo: m.tempo || '',
          prioridade: m.delegavel ? 'Alta' : 'Média',
          delegar: !!m.delegavel,
          fromCatalog: key
        }));
      }
    });
  });
  renderCatalog();
  renderDespejo();
  renderConcludeArea();
  saveNow();
}

// ===== LISTA =====
function addRow() {
  state.rows.push(newRow());
  renderDespejo();
  saveNow();
}

function removeRow(id) {
  state.rows = state.rows.filter(r => r.id !== id);
  renderCatalog();
  renderDespejo();
  renderConcludeArea();
  saveNow();
}

function moveRow(id, direction) {
  const idx = state.rows.findIndex(r => r.id === id);
  if (idx < 0) return;
  const newIdx = idx + direction;
  if (newIdx < 0 || newIdx >= state.rows.length) return;
  const r = state.rows.splice(idx, 1)[0];
  state.rows.splice(newIdx, 0, r);
  renderDespejo();
  saveNow();
}

// Campos onde digitação é contínua (livre, texto, data, url) :: debounce faz sentido
const CAMPOS_TEXTO_LIVRE = new Set([
  'micro', 'macro', 'tempo',
  'linkProcessoExistente', 'linkProcesso',
  'dataConclusao', 'dataStart',
  'praQuem', 'ferramentaGestao', 'formaAcompanhamento',
  'resultados30d', 'ajusteNecessario'
]);

function updateRow(id, field, value) {
  const r = state.rows.find(x => x.id === id);
  if (!r) return;
  r[field] = value;
  // Decide: digitação livre usa debounce. Evento pontual salva imediato.
  if (CAMPOS_TEXTO_LIVRE.has(field)) {
    save();
  } else {
    saveNow();
  }
  updateMeta();
  if (field === 'pilar') {
    document.querySelectorAll('select[data-row="' + id + '"][data-field="pilar"]').forEach(el => {
      el.setAttribute('data-pilar', value);
    });
  }
  // se mudou jaTemProcesso, re-renderiza o card todo
  if (field === 'jaTemProcesso' || field === 'delegar') {
    if (document.getElementById('step-5').classList.contains('active')) {
      renderPlano();
    }
  }
  // resumo da etapa 3
  const resD = document.getElementById('resumoDelegar');
  if (resD) resD.textContent = state.rows.filter(x=>x.delegar).length;
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function escapeJs(s) {
  // escape pra usar dentro de string JS literal num inline onclick
  if (s == null) return "''";
  return "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
}

function renderDespejo() {
  renderDesktopTable();
  renderMobileCards();
  const rc = document.getElementById('rowCount');
  if (rc) rc.textContent = state.rows.length + ' atividades';
  const rt = document.getElementById('resumoTotal');
  if (rt) rt.textContent = state.rows.length;
  const rd = document.getElementById('resumoDelegar');
  if (rd) rd.textContent = state.rows.filter(r => r.delegar).length;
  updateMeta();
}

const AREA_NAMES = AREAS.map(a => a.name);

function renderDesktopTable() {
  const tbody = document.getElementById('despejoBody');
  if (!tbody) return;
  tbody.innerHTML = '';
  state.rows.forEach((r, idx) => {
    const tr = document.createElement('tr');
    const upDisabled = idx === 0 ? 'disabled' : '';
    const downDisabled = idx === state.rows.length - 1 ? 'disabled' : '';
    tr.innerHTML = `
      <td class="row-num">${idx + 1}</td>
      <td>
        <select data-row="${r.id}" data-field="pilar" data-pilar="${escapeHtml(r.pilar)}" onchange="updateRow('${r.id}', 'pilar', this.value); this.setAttribute('data-pilar', this.value);">
          <option value="">selecione</option>
          <option ${r.pilar==='Estratégico'?'selected':''}>Estratégico</option>
          <option ${r.pilar==='Tático'?'selected':''}>Tático</option>
          <option ${r.pilar==='Operacional'?'selected':''}>Operacional</option>
        </select>
      </td>
      <td>
        <select onchange="updateRow('${r.id}', 'area', this.value)">
          <option value="">selecione</option>
          ${AREA_NAMES.map(a => `<option ${r.area===a?'selected':''}>${a}</option>`).join('')}
        </select>
      </td>
      <td><input type="text" value="${escapeHtml(r.macro)}" placeholder="ex: agenda" oninput="updateRow('${r.id}', 'macro', this.value)"></td>
      <td><textarea rows="1" placeholder="o que você faz exatamente" oninput="updateRow('${r.id}', 'micro', this.value); autoGrow(this);">${escapeHtml(r.micro)}</textarea></td>
      <td>
        <select onchange="updateRow('${r.id}', 'quemFaz', this.value)">
          <option value="">selecione</option>
          ${QUEM_OPTIONS.map(q => `<option ${r.quemFaz===q?'selected':''}>${q}</option>`).join('')}
        </select>
      </td>
      <td>
        <select onchange="updateRow('${r.id}', 'freq', this.value)">
          <option value="">freq.</option>
          ${FREQ_OPTIONS.map(f => `<option ${r.freq===f?'selected':''}>${f}</option>`).join('')}
        </select>
      </td>
      <td><input type="text" value="${escapeHtml(r.tempo)}" placeholder="ex: 30min" oninput="updateRow('${r.id}', 'tempo', this.value)"></td>
      <td>
        <select onchange="updateRow('${r.id}', 'prioridade', this.value)">
          <option value="">selecione</option>
          ${PRIO_OPTIONS.map(p => `<option ${r.prioridade===p?'selected':''}>${p}</option>`).join('')}
        </select>
      </td>
      <td class="checkbox-cell">
        <input type="checkbox" ${r.delegar?'checked':''} onchange="updateRow('${r.id}', 'delegar', this.checked);">
      </td>
      <td>
        <button class="icon-btn" onclick="moveRow('${r.id}', -1)" title="subir" ${upDisabled}>${window.Icons.arrowUp}</button>
        <button class="icon-btn" onclick="moveRow('${r.id}', 1)" title="descer" ${downDisabled}>${window.Icons.arrowDown}</button>
        <button class="icon-btn" onclick="removeRow('${r.id}')" title="remover">${window.Icons.x}</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function renderMobileCards() {
  const cont = document.getElementById('mobileCards');
  if (!cont) return;
  cont.innerHTML = '';
  state.rows.forEach((r, idx) => {
    const upDisabled = idx === 0 ? 'disabled' : '';
    const downDisabled = idx === state.rows.length - 1 ? 'disabled' : '';
    const div = document.createElement('div');
    div.className = 'mobile-card';
    div.innerHTML = `
      <div class="mobile-card-head">
        <span class="mobile-card-num">#${idx + 1}</span>
        <div class="mobile-card-actions">
          <button class="icon-btn" onclick="moveRow('${r.id}', -1)" ${upDisabled}>${window.Icons.arrowUp}</button>
          <button class="icon-btn" onclick="moveRow('${r.id}', 1)" ${downDisabled}>${window.Icons.arrowDown}</button>
          <button class="icon-btn" onclick="removeRow('${r.id}')">${window.Icons.x}</button>
        </div>
      </div>
      <div class="mobile-card-grid">
        <div class="full">
          <label class="field-label">Atividade (micro)</label>
          <textarea rows="2" placeholder="o que você faz exatamente" oninput="updateRow('${r.id}', 'micro', this.value); autoGrow(this);">${escapeHtml(r.micro)}</textarea>
        </div>
        <div>
          <label class="field-label">Nível</label>
          <select data-row="${r.id}" data-field="pilar" data-pilar="${escapeHtml(r.pilar)}" onchange="updateRow('${r.id}', 'pilar', this.value); this.setAttribute('data-pilar', this.value);">
            <option value="">selecione</option>
            <option ${r.pilar==='Estratégico'?'selected':''}>Estratégico</option>
            <option ${r.pilar==='Tático'?'selected':''}>Tático</option>
            <option ${r.pilar==='Operacional'?'selected':''}>Operacional</option>
          </select>
        </div>
        <div>
          <label class="field-label">Área</label>
          <select onchange="updateRow('${r.id}', 'area', this.value)">
            <option value="">selecione</option>
            ${AREA_NAMES.map(a => `<option ${r.area===a?'selected':''}>${a}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="field-label">Macro</label>
          <input type="text" value="${escapeHtml(r.macro)}" placeholder="ex: agenda" oninput="updateRow('${r.id}', 'macro', this.value)">
        </div>
        <div>
          <label class="field-label">Quem faz hoje</label>
          <select onchange="updateRow('${r.id}', 'quemFaz', this.value)">
            <option value="">selecione</option>
            ${QUEM_OPTIONS.map(q => `<option ${r.quemFaz===q?'selected':''}>${q}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="field-label">Frequência</label>
          <select onchange="updateRow('${r.id}', 'freq', this.value)">
            <option value="">selecione</option>
            ${FREQ_OPTIONS.map(f => `<option ${r.freq===f?'selected':''}>${f}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="field-label">Tempo</label>
          <input type="text" value="${escapeHtml(r.tempo)}" placeholder="ex: 30min" oninput="updateRow('${r.id}', 'tempo', this.value)">
        </div>
        <div>
          <label class="field-label">Prioridade</label>
          <select onchange="updateRow('${r.id}', 'prioridade', this.value)">
            <option value="">selecione</option>
            ${PRIO_OPTIONS.map(p => `<option ${r.prioridade===p?'selected':''}>${p}</option>`).join('')}
          </select>
        </div>
        <div class="full">
          <label class="field-label" style="display:flex;align-items:center;gap:8px;cursor:pointer;">
            <input type="checkbox" ${r.delegar?'checked':''} onchange="updateRow('${r.id}', 'delegar', this.checked);" style="width:auto;transform:scale(1.2);">
            Delegar essa atividade
          </label>
        </div>
      </div>
    `;
    cont.appendChild(div);
  });
}

function autoGrow(el) {
  el.style.height = 'auto';
  el.style.height = (el.scrollHeight) + 'px';
}

function parseTempoToMin(t) {
  if (!t) return 0;
  const s = String(t).toLowerCase().replace(',', '.');
  let total = 0;
  const hMatch = s.match(/([\d.]+)\s*h/);
  const mMatch = s.match(/([\d.]+)\s*min/);
  const numOnly = s.match(/^([\d.]+)$/);
  if (hMatch) total += parseFloat(hMatch[1]) * 60;
  if (mMatch) total += parseFloat(mMatch[1]);
  if (!hMatch && !mMatch && numOnly) total += parseFloat(numOnly[1]);
  return total || 0;
}

function freqMultiplier(f) {
  switch (f) {
    case 'Diário': return 5;
    case 'A cada 2 dias': return 2.5;
    case 'Semanal': return 1;
    case 'Quinzenal': return 0.5;
    case 'Mensal': return 0.25;
    case 'Conforme demanda': return 0.5;
    default: return 0;
  }
}

function updateMeta() {
  const total = state.rows.filter(r => r.micro || r.macro).length;
  const delegar = state.rows.filter(r => r.delegar).length;
  let tempoMin = 0;
  state.rows.forEach(r => {
    tempoMin += parseTempoToMin(r.tempo) * freqMultiplier(r.freq);
  });
  const horas = Math.round(tempoMin / 60);
  const t = document.getElementById('metaTotal');
  if (t) t.textContent = total;
  const d = document.getElementById('metaDelegar');
  if (d) d.textContent = delegar;
  const tp = document.getElementById('metaTempo');
  if (tp) tp.textContent = horas + 'h';
}

// ===== ETAPA 4 :: DIAGNÓSTICO =====
function renderSummary() {
  const cont = document.getElementById('step4Content');
  const valid = state.rows.filter(r => r.pilar);
  const total = valid.length;

  if (total < 1) {
    cont.innerHTML = `
      <div class="empty-state">
        <strong>Ainda não dá para ler o diagnóstico.</strong>
        <p>Volte na etapa 3 e classifique pelo menos algumas atividades por nível.</p>
      </div>`;
    return;
  }

  const est = valid.filter(r => r.pilar === 'Estratégico').length;
  const tat = valid.filter(r => r.pilar === 'Tático').length;
  const ope = valid.filter(r => r.pilar === 'Operacional').length;
  const del = state.rows.filter(r => r.delegar).length;

  const pct = (n) => total > 0 ? Math.round((n / total) * 100) : 0;
  const pctTotalGeral = state.rows.length > 0 ? Math.round((del / state.rows.length) * 100) : 0;

  const areas = {};
  const areasOp = {};
  state.rows.forEach(r => {
    if (r.area) {
      areas[r.area] = (areas[r.area] || 0) + 1;
      if (r.pilar === 'Operacional') {
        areasOp[r.area] = (areasOp[r.area] || 0) + 1;
      }
    }
  });

  let areaTopOp = null;
  let areaTopOpN = 0;
  Object.entries(areasOp).forEach(([s, n]) => {
    if (n > areaTopOpN) { areaTopOp = s; areaTopOpN = n; }
  });

  let diagMsg = '<strong>Leitura rápida:</strong> ';
  const opPct = pct(ope);
  const estPct = pct(est);
  if (opPct >= 60) {
    diagMsg += `${opPct}% do que você faz é operacional. Sua semana é uma corrida de execução. Sem delegar, não tem espaço para crescer.`;
  } else if (opPct >= 40) {
    diagMsg += `Operacional pesa ${opPct}%. Já não é o pior cenário, mas ainda atrapalha. Foque em delegar as tarefas operacionais com prioridade alta.`;
  } else if (estPct < 15 && total >= 5) {
    diagMsg += `Você mapeou pouca coisa estratégica (${estPct}%). Pode ser que o estratégico está saindo da rotina. Sem espaço para o estratégico, o consultório para de evoluir.`;
  } else {
    diagMsg += `Distribuição saudável. Foque agora em garantir que o que está marcado para delegar realmente sai da sua mão na etapa 5.`;
  }
  if (areaTopOp && areaTopOpN >= 2) {
    diagMsg += ` A área onde mais tem operacional é <strong>${escapeHtml(areaTopOp)}</strong> (${areaTopOpN} atividades). Comece por aí.`;
  }

  const totalArea = Object.values(areas).reduce((a,b) => a+b, 0);
  const sortedAreas = Object.entries(areas).sort((a,b) => b[1]-a[1]);
  const areasHtml = sortedAreas.length === 0
    ? '<div style="font-size:13px; color: var(--ink-muted); padding: 12px 0;">Sem áreas preenchidas ainda.</div>'
    : sortedAreas.map(([s, n]) => {
        const p = totalArea > 0 ? Math.round((n / totalArea) * 100) : 0;
        return `
          <div class="heat-row">
            <div class="heat-label">${escapeHtml(s)}</div>
            <div class="heat-bar-container"><div class="heat-bar area" style="width: ${p}%;"></div></div>
            <div class="heat-num">${n}</div>
          </div>`;
      }).join('');

  cont.innerHTML = `
    <div class="summary-grid">
      <div class="stat-card accent-teal">
        <div class="stat-label">Total classificado</div>
        <div class="stat-value">${total}</div>
        <div class="stat-sub">de ${state.rows.length} no total</div>
      </div>
      <div class="stat-card accent-terracotta">
        <div class="stat-label">Estratégicas</div>
        <div class="stat-value">${est}</div>
        <div class="stat-sub">${pct(est)}% das classificadas</div>
      </div>
      <div class="stat-card accent-orange">
        <div class="stat-label">Táticas</div>
        <div class="stat-value">${tat}</div>
        <div class="stat-sub">${pct(tat)}% das classificadas</div>
      </div>
      <div class="stat-card accent-teal">
        <div class="stat-label">Operacionais</div>
        <div class="stat-value">${ope}</div>
        <div class="stat-sub">${pct(ope)}% das classificadas</div>
      </div>
      <div class="stat-card accent-lime">
        <div class="stat-label">Para delegar</div>
        <div class="stat-value">${del}</div>
        <div class="stat-sub">${pctTotalGeral}% do total</div>
      </div>
    </div>

    <div class="heat-section">
      <h3>Distribuição por nível</h3>
      <div class="heat-sub">Quanto da sua semana está em cada camada</div>
      <div class="heat-row">
        <div class="heat-label" style="color: var(--terracotta);">Estratégico</div>
        <div class="heat-bar-container"><div class="heat-bar estrategico" style="width: ${pct(est)}%;"></div></div>
        <div class="heat-num">${pct(est)}%</div>
      </div>
      <div class="heat-row">
        <div class="heat-label" style="color: var(--orange);">Tático</div>
        <div class="heat-bar-container"><div class="heat-bar tatico" style="width: ${pct(tat)}%;"></div></div>
        <div class="heat-num">${pct(tat)}%</div>
      </div>
      <div class="heat-row">
        <div class="heat-label" style="color: var(--teal);">Operacional</div>
        <div class="heat-bar-container"><div class="heat-bar operacional" style="width: ${pct(ope)}%;"></div></div>
        <div class="heat-num">${pct(ope)}%</div>
      </div>
    </div>

    <div class="heat-section" style="margin-top: 16px;">
      <h3>Por área</h3>
      <div class="heat-sub">Onde sua atenção está indo</div>
      ${areasHtml}
    </div>

    ${total >= 3 ? `<div class="insight-box">${diagMsg}</div>` : ''}
  `;
}

// ===== ETAPA 5 :: PLANO =====
function renderPlano() {
  const container = document.getElementById('planoContainer');
  const toDelegate = state.rows.filter(r => r.delegar && (r.micro || r.macro));

  if (toDelegate.length === 0) {
    const totalRows = state.rows.filter(r => r.micro || r.macro).length;
    const msg = totalRows === 0
      ? 'Você ainda não listou nenhuma atividade. Volta na etapa 3.'
      : 'Você listou atividades, mas não marcou nenhuma como "delegar". Volta na etapa 3 e marca o checkbox <strong>Delegar?</strong> nas atividades que outra pessoa pode tocar.';
    container.innerHTML = `
      <div class="empty-state">
        <strong>Nenhum plano de delegação ainda.</strong>
        <p>${msg}</p>
        <p style="margin-top: 12px;"><button class="btn" onclick="goStep(3)">${window.Icons.arrowLeft} ir para etapa 3</button></p>
      </div>`;
    return;
  }

  container.innerHTML = toDelegate.map(r => renderPlanCard(r)).join('');
}

function renderPlanCard(r) {
  const prioRaw = (r.prioridade || '').toLowerCase();
  const prioClass = prioRaw === 'média' ? 'media' : prioRaw;
  const prioTag = r.prioridade ? `<span class="tag ${prioClass}">prioridade ${r.prioridade.toLowerCase()}</span>` : '';
  const freqTag = r.freq ? `<span>${escapeHtml(r.freq)}</span>` : '';
  const tempoTag = r.tempo ? `<span>${escapeHtml(r.tempo)}</span>` : '';
  const areaTag = r.area ? `<span>${escapeHtml(r.area)}</span>` : '';
  const quemHojeTag = r.quemFaz ? `<span>hoje: ${escapeHtml(r.quemFaz)}</span>` : '';

  // FASE 0 :: já tem processo desenhado?
  const jaTem = r.jaTemProcesso;
  const fase0Html = `
    <div class="plan-zero">
      <strong>Antes de começar: essa atividade já tem processo desenhado em algum lugar?</strong>
      <div class="plan-zero-options">
        <label class="${jaTem === 'sim' ? 'active' : ''}" onclick="updateRow('${r.id}', 'jaTemProcesso', 'sim')">
          <input type="radio" name="jt-${r.id}" ${jaTem === 'sim' ? 'checked' : ''}>
          Sim, já tem
        </label>
        <label class="${jaTem === 'nao' ? 'active' : ''}" onclick="updateRow('${r.id}', 'jaTemProcesso', 'nao')">
          <input type="radio" name="jt-${r.id}" ${jaTem === 'nao' ? 'checked' : ''}>
          Não, preciso desenhar
        </label>
      </div>
      ${jaTem === 'sim' ? `
        <div class="plan-zero-link">
          <label class="field-label">Link do processo (Notion, Drive, planilha...)</label>
          <input type="url" value="${escapeHtml(r.linkProcessoExistente)}" placeholder="cole o link aqui" oninput="updateRow('${r.id}', 'linkProcessoExistente', this.value)">
          <span class="field-help">Onde está documentado hoje. Pode ser link, ou só o nome da pasta/arquivo.</span>
        </div>
      ` : ''}
    </div>
  `;

  // FASE 1 :: definir processo (só ativa se nao tem)
  const fase1Disabled = jaTem === 'sim';
  const fase1Html = `
    <div class="plan-phase fase-1 ${fase1Disabled ? 'plan-phase-disabled' : ''}">
      <div class="plan-phase-title"><span class="plan-phase-num">1.</span>Definir o processo</div>
      <div class="plan-phase-help">Mapear quem vai documentar essa atividade e como vai ficar registrado para outra pessoa fazer igual a você.</div>
      <div class="field-stack">
        <div>
          <label class="field-label">Quem vai desenhar o processo</label>
          <select onchange="updateRow('${r.id}', 'quemDesenha', this.value)">
            <option value="">selecione</option>
            <option ${r.quemDesenha==='Eu mesma'?'selected':''}>Eu mesma</option>
            <option ${r.quemDesenha==='Secretária'?'selected':''}>Secretária</option>
            <option ${r.quemDesenha==='Recepcionista'?'selected':''}>Recepcionista</option>
            <option ${r.quemDesenha==='Sócia(o)'?'selected':''}>Sócia(o)</option>
            <option ${r.quemDesenha==='Contratar alguém'?'selected':''}>Contratar alguém de fora</option>
            <option ${r.quemDesenha==='Outro'?'selected':''}>Outro</option>
          </select>
          <span class="field-help">Se for você mesma, marca isso. Não vale fingir que vai documentar "depois" sem dono.</span>
        </div>
        <div>
          <label class="field-label">Como vai desenhar</label>
          <select onchange="updateRow('${r.id}', 'comoDesenhar', this.value)">
            <option value="">selecione</option>
            <option ${r.comoDesenhar==='Sentar e escrever do zero'?'selected':''}>Sentar e escrever do zero</option>
            <option ${r.comoDesenhar==='Gravar você fazendo e transcrever'?'selected':''}>Gravar você fazendo e transcrever</option>
            <option ${r.comoDesenhar==='Acompanhar quem faz hoje, mapeando os passos'?'selected':''}>Acompanhar quem faz hoje, mapeando os passos</option>
            <option ${r.comoDesenhar==='Adaptar de modelo pronto'?'selected':''}>Adaptar de modelo pronto</option>
          </select>
          <span class="field-help">A forma mais rápida costuma ser gravar um vídeo de você fazendo e depois transcrever os passos.</span>
        </div>
        <div>
          <label class="field-label">Onde vai ficar registrado</label>
          <select onchange="updateRow('${r.id}', 'como', this.value)">
            <option value="">selecione</option>
            <option ${r.como==='Notion'?'selected':''}>Notion (passo a passo escrito)</option>
            <option ${r.como==='Google Drive'?'selected':''}>Google Drive (documento ou planilha)</option>
            <option ${r.como==='Miro'?'selected':''}>Miro (fluxograma)</option>
            <option ${r.como==='Planilha'?'selected':''}>Planilha (checklist)</option>
            <option ${r.como==='Vídeo gravado'?'selected':''}>Vídeo gravado</option>
            <option ${r.como==='Outro'?'selected':''}>Outro</option>
          </select>
          <span class="field-help">Para atividade simples e repetida, vídeo de 3min funciona. Para processo com decisões, escreve no Notion ou Drive.</span>
        </div>
        <div>
          <label class="field-label">Link do processo (depois de desenhado)</label>
          <input type="url" value="${escapeHtml(r.linkProcesso)}" placeholder="cole o link quando estiver pronto" oninput="updateRow('${r.id}', 'linkProcesso', this.value)">
          <span class="field-help">Vai colando aqui assim que documentar. Esse link aparece também na gestão diária.</span>
        </div>
        <div>
          <label class="field-label">Data para concluir o desenho</label>
          <input type="date" value="${escapeHtml(r.dataConclusao)}" oninput="updateRow('${r.id}', 'dataConclusao', this.value)">
          <span class="field-help">Coloca uma data realista. 7 a 14 dias para atividade simples, 30 para processo complexo.</span>
        </div>
        <div>
          <label class="field-label">Status</label>
          <select onchange="updateRow('${r.id}', 'statusProcesso', this.value)">
            <option value="">selecione</option>
            <option ${r.statusProcesso==='A fazer'?'selected':''}>A fazer</option>
            <option ${r.statusProcesso==='Em andamento'?'selected':''}>Em andamento</option>
            <option ${r.statusProcesso==='Concluído'?'selected':''}>Concluído</option>
          </select>
        </div>
      </div>
    </div>
  `;

  // FASE 2 :: começar
  const fase2Html = `
    <div class="plan-phase fase-2">
      <div class="plan-phase-title"><span class="plan-phase-num">2.</span>Começar (start)</div>
      <div class="plan-phase-help">A hora de tirar a tarefa da sua mão e colocar na de outra pessoa. Define data, define forma, define quem recebe.</div>
      <div class="field-stack">
        <div>
          <label class="field-label">Como vai começar</label>
          <select onchange="updateRow('${r.id}', 'startComo', this.value)">
            <option value="">selecione</option>
            <option ${r.startComo==='Treinamento'?'selected':''}>Treinamento (sentar junto, explicar)</option>
            <option ${r.startComo==='Acompanhar fazendo'?'selected':''}>Acompanhar fazendo (1ª semana junto)</option>
            <option ${r.startComo==='Entregar processo pronto'?'selected':''}>Entregar processo pronto (ela lê e faz)</option>
          </select>
          <span class="field-help">Quanto mais crítica a tarefa, mais junto você fica no começo.</span>
        </div>
        <div>
          <label class="field-label">Data de início</label>
          <input type="date" value="${escapeHtml(r.dataStart)}" oninput="updateRow('${r.id}', 'dataStart', this.value)">
          <span class="field-help">Geralmente 1 a 2 semanas depois de documentar.</span>
        </div>
        <div>
          <label class="field-label">Para quem (nome)</label>
          <input type="text" value="${escapeHtml(r.praQuem)}" placeholder="ex: Larissa, Mariana..." oninput="updateRow('${r.id}', 'praQuem', this.value)">
          <span class="field-help">Nome da pessoa específica. Não vale "a equipe". Equipe não é responsável, pessoa é.</span>
        </div>
        <div>
          <label class="field-label">Status</label>
          <select onchange="updateRow('${r.id}', 'statusStart', this.value)">
            <option value="">selecione</option>
            <option ${r.statusStart==='A fazer'?'selected':''}>A fazer</option>
            <option ${r.statusStart==='Em andamento'?'selected':''}>Em andamento</option>
            <option ${r.statusStart==='Concluído'?'selected':''}>Concluído</option>
          </select>
        </div>
      </div>
    </div>
  `;

  // FASE 3 :: acompanhar 30 dias
  const fase3Html = `
    <div class="plan-phase fase-3">
      <div class="plan-phase-title"><span class="plan-phase-num">3.</span>Acompanhar 30 dias</div>
      <div class="plan-phase-help">Os primeiros 30 dias decidem se a delegação rodou ou se você vai ter que retomar. Sem essa fase, a tarefa volta para sua mão sem você perceber.</div>
      <div class="field-stack">
        <div>
          <label class="field-label">Onde você acompanha</label>
          <input type="text" value="${escapeHtml(r.ferramentaGestao)}" placeholder="ex: planilha, Trello, Notion" oninput="updateRow('${r.id}', 'ferramentaGestao', this.value)">
          <span class="field-help">Lugar onde a pessoa registra que fez. Você confere aqui, não pergunta toda hora.</span>
        </div>
        <div>
          <label class="field-label">Como você acompanha</label>
          <input type="text" value="${escapeHtml(r.formaAcompanhamento)}" placeholder="ex: reunião de sexta, check semanal" oninput="updateRow('${r.id}', 'formaAcompanhamento', this.value)">
          <span class="field-help">Frequência fixa. Recomendo semanal nos primeiros 30 dias, depois quinzenal.</span>
        </div>
        <div>
          <label class="field-label">Resultado em 30 dias</label>
          <textarea rows="2" placeholder="o que rodou bem, o que não rodou" oninput="updateRow('${r.id}', 'resultados30d', this.value)">${escapeHtml(r.resultados30d)}</textarea>
          <span class="field-help">Preencher depois dos 30 dias. Honesto. Se voltou para sua mão, escreva.</span>
        </div>
        <div>
          <label class="field-label">Ajuste necessário</label>
          <textarea rows="2" placeholder="o que precisa mudar para rodar melhor" oninput="updateRow('${r.id}', 'ajusteNecessario', this.value)">${escapeHtml(r.ajusteNecessario)}</textarea>
          <span class="field-help">Se voltou para sua mão: foi falta de processo, falta de pessoa certa, ou falta de ferramenta?</span>
        </div>
      </div>
    </div>
  `;

  return `
    <div class="plan-card">
      <div class="plan-card-head">
        <div class="plan-task-info">
          <div class="plan-task-name">${escapeHtml(r.micro || r.macro || 'Atividade')}</div>
          <div class="plan-task-meta">
            ${areaTag}
            ${freqTag}
            ${tempoTag}
            ${quemHojeTag}
            ${prioTag}
          </div>
        </div>
      </div>
      ${fase0Html}
      <div class="plan-grid">
        ${fase1Html}
        ${fase2Html}
        ${fase3Html}
      </div>
    </div>
  `;
}

function printPlan() {
  goStep(5);
  setTimeout(function() { window.print(); }, 300);
}

// ===== BAIXAR PLANILHA (CSV que abre no Excel/Google Sheets) =====
function baixarExcel() {
  if (!state.rows || state.rows.length === 0) {
    alert('Você ainda não listou nenhuma atividade. Volta na etapa 3 e adiciona algumas.');
    return;
  }

  const cabecalho = [
    'Nível', 'Área', 'Macro', 'Atividade (micro)', 'Quem faz hoje',
    'Frequência', 'Tempo', 'Prioridade', 'Delegar?',
    'Já tem processo?', 'Link do processo',
    'Quem desenha', 'Como desenhar', 'Onde fica registrado',
    'Data conclusão (desenho)', 'Status do desenho',
    'Como começar', 'Data de início', 'Para quem (nome)', 'Status do start',
    'Onde acompanha', 'Como acompanha', 'Resultados 30d', 'Ajuste necessário'
  ];

  const escapeCsv = (v) => {
    if (v == null) return '';
    const s = String(v);
    if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes(';')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };

  const linhas = state.rows.map(r => [
    r.pilar, r.area, r.macro, r.micro, r.quemFaz,
    r.freq, r.tempo, r.prioridade, r.delegar ? 'Sim' : 'Não',
    r.jaTemProcesso === 'sim' ? 'Sim' : (r.jaTemProcesso === 'nao' ? 'Não' : ''),
    r.linkProcessoExistente || r.linkProcesso || '',
    r.quemDesenha, r.comoDesenhar, r.como,
    r.dataConclusao, r.statusProcesso,
    r.startComo, r.dataStart, r.praQuem, r.statusStart,
    r.ferramentaGestao, r.formaAcompanhamento, r.resultados30d, r.ajusteNecessario
  ].map(escapeCsv).join(';'));

  // BOM no início pra Excel reconhecer acentos
  const csv = '\uFEFF' + cabecalho.map(escapeCsv).join(';') + '\n' + linhas.join('\n');

  const hoje = new Date().toISOString().slice(0, 10);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `saia-do-operacional-${hoje}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ===== INIT =====
(async function() {
  try {
    // protege a página
    const session = await window.AppAuth.requireAuth();
    if (!session) return;

    // header
    await window.renderHeader('app');

    // ícones
    bootIcons();

    // estado
    await loadState();
    renderAreas();
    renderDespejo();

    // proteção: se fechar a aba ou recarregar, força save imediato
    window.addEventListener('beforeunload', () => {
      try { window.AppAuth.salvarEstadoAgora(state); } catch(e) {}
    });
  } catch (err) {
    console.error('[Saia] Erro na inicialização do app:', err);
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.innerHTML = `
        <div style="background:white;padding:32px;border-radius:12px;max-width:520px;text-align:left;border:1px solid #c63939;">
          <h2 style="font-family:Fraunces,serif;font-size:22px;color:#c63939;margin-bottom:12px;">Erro ao carregar a ferramenta</h2>
          <p style="font-size:14px;color:#4a4a4a;line-height:1.5;margin-bottom:16px;">
            Algo travou ao iniciar. Detalhes técnicos para mostrar pra Fá ou pro suporte:
          </p>
          <pre style="background:#f4f1ea;padding:12px;border-radius:6px;font-size:11px;color:#1a1a1a;overflow:auto;max-height:200px;white-space:pre-wrap;">${(err && err.message) ? err.message : String(err)}</pre>
          <div style="margin-top:18px;display:flex;gap:8px;">
            <button onclick="location.reload()" style="padding:10px 16px;border-radius:6px;background:#026a77;color:white;border:none;cursor:pointer;font-weight:500;">Tentar de novo</button>
            <button onclick="window.AppAuth.signOut()" style="padding:10px 16px;border-radius:6px;background:white;border:1px solid #d8d3c7;cursor:pointer;">Sair</button>
          </div>
        </div>
      `;
    }
    return;
  }

  // tira loading
  document.getElementById('loadingOverlay').classList.add('hidden');
})();
