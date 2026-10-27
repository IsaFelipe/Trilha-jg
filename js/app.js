/* ==========================================================
   Trilha do Consultor JG
   Todo o conteúdo vem de data/trilha.json — não é preciso
   editar este arquivo para trocar links, títulos ou vídeos.
   ========================================================== */
(function () {
  'use strict';

  var PLACEHOLDER = 'COLE_O_LINK_AQUI';
  var STORE_KEY = 'jg-trilha-progresso-v1';
  var FONT_STEPS = [1, 1.15, 1.3];

  var DATA = null;
  var LEVELS = [];      // todos os níveis, na ordem da trilha
  var MATERIALS = [];   // todos os materiais (trilha + complementares)
  var homeIdx = null;   // planeta visível no carrossel
  var firstRender = true;
  var lastFocus = null;
  var libFilters = { q: '', mod: '', fmt: '' };

  var main = document.getElementById('main');

  /* ---------- Avatares (desenhados em SVG, sem imagens externas) ---------- */
  var AVATARS = [
    { nome: 'Astronauta turquesa', tipo: 'astro', fundo: '#3CC3B5', traje: '#EEF2FC', visor: '#0F1A4A', detalhe: '#F5C84C' },
    { nome: 'Astronauta roxo', tipo: 'astro', fundo: '#8040C0', traje: '#F7F2FF', visor: '#280D48', detalhe: '#3CC3B5' },
    { nome: 'Robô amarelo', tipo: 'robo', fundo: '#F5C84C', traje: '#D8C4F0', visor: '#280D48', detalhe: '#3CC3B5' },
    { nome: 'Robô azul', tipo: 'robo', fundo: '#6FA8FF', traje: '#EEF2FC', visor: '#0F1A4A', detalhe: '#F07A8C' },
    { nome: 'Alien verde', tipo: 'alien', fundo: '#441F67', traje: '#7EDC8B', visor: '#0F1A4A', detalhe: '#F5C84C' },
    { nome: 'Alien rosa', tipo: 'alien', fundo: '#0F1A4A', traje: '#F07A8C', visor: '#280D48', detalhe: '#C3A7EF' }
  ];

  /* ---------- Ícones ---------- */
  var ICONS = {
    arrowL: '<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
    arrowR: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    rocket: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
    video: '<rect x="2" y="6" width="14" height="12" rx="2"/><path d="m22 8-6 4 6 4V8z"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    external: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    ppt: '<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M12 16v4M8 20h8"/><path d="M8 12V9M12 12V7M16 12v-2"/>',
    pdf: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
    doc: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h6"/>',
    sheet: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>',
    form: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="m8 9 1.5 1.5L12 8M8 15l1.5 1.5L12 14M14 9h2M14 15h2"/>',
    other: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>'
  };
  function ic(name) {
    return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (ICONS[name] || '') + '</svg>';
  }
  var STAR = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" fill="currentColor"/></svg>';

  var FORMATS = {
    ppt: { label: 'PPT', nome: 'PPT' },
    pdf: { label: 'PDF', nome: 'PDF' },
    doc: { label: 'DOC', nome: 'Documento' },
    sheet: { label: 'XLS', nome: 'Planilha' },
    form: { label: 'FORM', nome: 'Formulário' },
    video: { label: 'VÍDEO', nome: 'Vídeo' },
    other: { label: 'ARQ', nome: 'Outro' }
  };

  /* ---------- Utilidades ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function plain(s) {
    return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }
  function fmtKey(f) {
    var s = plain(f);
    if (/ppt|apresenta|slide/.test(s)) return 'ppt';
    if (/pdf/.test(s)) return 'pdf';
    if (/doc|texto/.test(s)) return 'doc';
    if (/planilha|xls|sheet|excel/.test(s)) return 'sheet';
    if (/form/.test(s)) return 'form';
    if (/video/.test(s)) return 'video';
    return 'other';
  }
  function isReady(link) {
    return typeof link === 'string' && /^https?:\/\//i.test(link.trim()) && link.indexOf(PLACEHOLDER) === -1;
  }
  function mix(a, b, t) {
    var pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    var r = Math.round(((pa >> 16) & 255) * (1 - t) + ((pb >> 16) & 255) * t);
    var g = Math.round(((pa >> 8) & 255) * (1 - t) + ((pb >> 8) & 255) * t);
    var bl = Math.round((pa & 255) * (1 - t) + (pb & 255) * t);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1);
  }

  /* Converte links do Drive/YouTube/Vimeo para o endereço que pode ser incorporado. */
  function toEmbed(url) {
    if (!isReady(url)) return null;
    url = url.trim();
    var m;
    if ((m = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/))) return 'https://drive.google.com/file/d/' + m[1] + '/preview';
    if ((m = url.match(/drive\.google\.com\/(?:open|uc)\?(?:.*&)?id=([\w-]+)/))) return 'https://drive.google.com/file/d/' + m[1] + '/preview';
    if ((m = url.match(/docs\.google\.com\/(document|presentation|spreadsheets)\/d\/([\w-]+)/))) return 'https://docs.google.com/' + m[1] + '/d/' + m[2] + '/preview';
    if ((m = url.match(/docs\.google\.com\/forms\/d\/(e\/)?([\w-]+)/))) return 'https://docs.google.com/forms/d/' + (m[1] || '') + m[2] + '/viewform?embedded=true';
    if ((m = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/))) return 'https://www.youtube-nocookie.com/embed/' + m[1];
    if ((m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/))) return 'https://player.vimeo.com/video/' + m[1];
    return null;
  }

  /* ---------- Progresso (localStorage) ---------- */
  function defaultState() { return { avatar: 0, font: 0, done: {}, opened: {}, rewarded: {} }; }
  function loadState() {
    try {
      var s = JSON.parse(localStorage.getItem(STORE_KEY));
      if (s && typeof s === 'object') {
        var d = defaultState();
        for (var k in d) if (s[k] != null) d[k] = s[k];
        return d;
      }
    } catch (e) { /* navegador sem armazenamento: segue sem salvar */ }
    return defaultState();
  }
  var state = loadState();
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* ignora */ }
  }

  /* ---------- Regras de pontos e selos ---------- */
  function points() {
    var c = DATA.config.pontos, p = 0, seen = {};
    MATERIALS.forEach(function (m) {
      if (!seen[m.id] && state.opened[m.id]) p += c.material;
      seen[m.id] = true;
    });
    LEVELS.forEach(function (l) { if (state.done[l.id]) p += c.nivel; });
    return p;
  }
  function planetDone(p) { return p.niveis.filter(function (n) { return state.done[n.id]; }).length; }
  function planetComplete(p) { return p.niveis.length > 0 && planetDone(p) === p.niveis.length; }
  function planetsCompleted() { return DATA.planetas.filter(planetComplete).length; }
  /* O selo atual é o do planeta concluído mais avançado na trilha (null = ainda nenhum). */
  function seloAtual() {
    var s = null;
    DATA.planetas.forEach(function (p) { if (planetComplete(p)) s = p; });
    return s;
  }
  function seloNome(p) { return p ? (p.selo || p.nome) : DATA.config.seloInicial; }
  /* Só destaca a ordem sugerida: nada é bloqueado de verdade. */
  function levelStatus(n) {
    if (state.done[n.id]) return 'done';
    var prev = LEVELS[n.gIndex - 1];
    var firstOpen = LEVELS.filter(function (l) { return !state.done[l.id]; })[0];
    if (!prev || state.done[prev.id] || firstOpen === n) return 'open';
    return 'locked';
  }
  var STATUS = {
    done: { label: 'Concluído', icon: 'check' },
    open: { label: 'Disponível', icon: 'rocket' },
    locked: { label: 'Bloqueado', icon: 'lock' }
  };

  /* ---------- Desenhos (SVG) ---------- */
  /* Ilustração temática de cada planeta (campo "tema" em "visual" no trilha.json).
     back = atrás do planeta (o que fica "em pé" na superfície), inside = na superfície, front = na frente. */
  function bubble(x, y, r) {
    return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#fff" fill-opacity=".15" stroke="#fff" stroke-opacity=".85" stroke-width="1.5"/>';
  }
  var THEMES = {
    // Imersão JG: mergulho no oceano JG, com bandeira, ondas, peixes e bolhas
    oceano: function (c, s, hl) {
      var waves = [74, 98, 122, 146].map(function (y, i) {
        return '<path d="M20 ' + y + 'q10-7 20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0" fill="none" stroke="' + (i % 2 ? '#fff' : hl) + '" stroke-opacity="' + (i % 2 ? 0.35 : 0.7) + '" stroke-width="4" stroke-linecap="round"/>';
      }).join('');
      return {
        back: '<line x1="80" y1="44" x2="80" y2="12" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>' +
          '<path d="M80 12h26l-6 7 6 7H80z" fill="#F5C84C"/>' +
          '<text x="84" y="23" font-family="Poppins,Arial,sans-serif" font-size="10" font-weight="800" fill="#0F1A4A">JG</text>',
        inside: '<rect x="30" y="112" width="140" height="60" fill="' + s + '" opacity=".35"/>' + waves +
          '<path d="M112 108q9-8 18 0q-9 8-18 0z" fill="#F5C84C"/><path d="M112 108l-7-5v10z" fill="#F5C84C"/><circle cx="125" cy="106.5" r="1.4" fill="#0F1A4A"/>' +
          '<path d="M66 134q7-6 14 0q-7 6-14 0z" fill="#FF8FB1"/><path d="M80 134l6-4v8z" fill="#FF8FB1"/><circle cx="70" cy="133" r="1.2" fill="#0F1A4A"/>',
        front: bubble(150, 52, 5) + bubble(160, 36, 3.5) + bubble(146, 24, 4) + bubble(163, 15, 2.5)
      };
    },
    // Cliente e mercado: o município, com prefeitura, prédios e pinos no mapa
    cidade: function (c) {
      var bld = mix(c, '#ffffff', 0.55), wall = '#EEF2FC';
      function win(x, y) { return '<rect x="' + x + '" y="' + y + '" width="3" height="4" fill="#F5C84C"/>'; }
      function pin(x, y, cor) {
        return '<path d="M' + x + ' ' + y + 'c-6 0-9 4-9 8 0 6 9 14 9 14s9-8 9-14c0-4-3-8-9-8z" fill="' + cor + '"/><circle cx="' + x + '" cy="' + (y + 8) + '" r="3" fill="#fff"/>';
      }
      return {
        back: '<rect x="62" y="28" width="16" height="22" rx="1.5" fill="' + bld + '"/>' + win(66, 32) + win(71, 32) + win(66, 39) + win(71, 39) +
          '<rect x="122" y="18" width="16" height="32" rx="1.5" fill="' + bld + '"/>' + win(126, 22) + win(131, 22) + win(126, 29) + win(131, 29) + win(126, 36) + win(131, 36) +
          '<rect x="82" y="22" width="36" height="22" fill="' + wall + '"/>' +
          '<path d="M79 22 100 9l21 13z" fill="' + wall + '"/><circle cx="100" cy="17" r="3" fill="' + c + '"/>' +
          '<path d="M87 26v14M94 26v14M106 26v14M113 26v14" stroke="' + mix(c, '#280D48', 0.4) + '" stroke-width="3"/>' +
          '<rect x="97" y="31" width="6" height="11" rx="3" fill="#280D48"/>',
        inside: '<path d="M30 70H170M30 100H170M30 130H170M70 30V170M100 30V170M130 30V170" stroke="#fff" stroke-opacity=".22" stroke-width="2"/>' +
          pin(76, 74, '#F07A8C') + pin(122, 92, '#8040C0') + pin(92, 116, '#2559C7')
      };
    },
    // Prática comercial: conversa (balões de fala) e gráfico de vendas subindo
    conversa: function () {
      return {
        inside: '<path d="M58 150 80 122l20 12 20-32 24-18" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>' +
          '<path d="M134 78l10 6-11 4" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>',
        front: '<path d="M16 22h44a9 9 0 0 1 9 9v14a9 9 0 0 1-9 9H36l-9 8v-8H16a9 9 0 0 1-9-9V31a9 9 0 0 1 9-9z" fill="#fff"/>' +
          '<circle cx="27" cy="38" r="3" fill="#8040C0"/><circle cx="38" cy="38" r="3" fill="#8040C0"/><circle cx="49" cy="38" r="3" fill="#8040C0"/>' +
          '<path d="M140 136h44a9 9 0 0 1 9 9v12a9 9 0 0 1-9 9h-8v8l-9-8h-27a9 9 0 0 1-9-9v-12a9 9 0 0 1 9-9z" fill="#F5C84C"/>' +
          '<path d="M151 151l6 6 12-11" stroke="#0F1A4A" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
      };
    },
    // Campo acompanhado: duas pessoas lado a lado, trilha no campo e bandeira de chegada
    campo: function (c, s) {
      function tree(x, y) { return '<rect x="' + (x - 1.5) + '" y="' + y + '" width="3" height="7" fill="#6B4A2B"/><circle cx="' + x + '" cy="' + (y - 3) + '" r="7" fill="' + s + '"/>'; }
      function person(x, cor) { return '<circle cx="' + x + '" cy="16" r="5" fill="#FBD9B5"/><rect x="' + (x - 6) + '" y="23" width="12" height="20" rx="6" fill="' + cor + '"/>'; }
      return {
        back: person(90, '#F5C84C') + person(110, '#8040C0'),
        inside: '<path d="M44 146C70 128 64 108 96 100s30-26 44-30" fill="none" stroke="#F6E7B8" stroke-width="8" stroke-linecap="round"/>' +
          tree(70, 90) + tree(132, 118) + tree(58, 120) + tree(112, 142) + tree(84, 72) +
          '<path d="M140 72V56" stroke="#fff" stroke-width="2"/><path d="M140 56h11l-3 4 3 4h-11z" fill="#F07A8C"/>'
      };
    },
    // Aferição: troféu no topo e checklist de prontidão na superfície
    trofeu: function (c, s) {
      var g = '#F5C84C';
      function row(y) {
        return '<rect x="70" y="' + (y - 7) + '" width="14" height="14" rx="3" fill="#fff" fill-opacity=".9"/>' +
          '<path d="M73 ' + y + 'l3 3 6-6" stroke="' + s + '" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
          '<path d="M92 ' + y + 'h40" stroke="#fff" stroke-opacity=".7" stroke-width="5" stroke-linecap="round"/>';
      }
      return {
        back: '<path d="M85 13c-9 0-10 13 2 15M115 13c9 0 10 13-2 15" fill="none" stroke="' + g + '" stroke-width="3"/>' +
          '<path d="M85 8h30v12a15 15 0 0 1-30 0z" fill="' + g + '"/>' +
          '<path d="M100 11l2.2 4.6 5 .6-3.7 3.4 1 5-4.5-2.5-4.5 2.5 1-5-3.7-3.4 5-.6z" fill="#fff"/>' +
          '<rect x="96" y="33" width="8" height="6" fill="#C9962A"/><rect x="88" y="38" width="24" height="7" rx="2" fill="' + g + '"/>',
        inside: row(84) + row(104) + row(124)
      };
    }
  };

  function planetSVG(p, key) {
    var v = p.visual || {};
    var c = v.cor || '#3CC3B5';
    var s = v.sombra || mix(c, '#000000', 0.5);
    var hl = mix(c, '#ffffff', 0.45);
    var ringC = v.corAnel || mix(c, '#F5C84C', 0.5);
    var id = 'pl-' + p.id + '-' + key;
    function ring(sweep, op) {
      return '<path d="M8 100 A92 24 0 0 ' + sweep + ' 192 100" fill="none" stroke="' + ringC + '" stroke-width="9" stroke-linecap="round" opacity="' + op + '" transform="rotate(-16 100 100)"/>';
    }
    var art = THEMES[v.tema] ? THEMES[v.tema](c, s, hl) : {};
    var deco = art.inside || '';
    if (v.faixas) {
      deco += '<ellipse cx="100" cy="76" rx="90" ry="9" fill="' + s + '" opacity=".35"/>' +
        '<ellipse cx="100" cy="108" rx="90" ry="12" fill="' + hl + '" opacity=".3"/>' +
        '<ellipse cx="100" cy="138" rx="90" ry="7" fill="' + s + '" opacity=".3"/>';
    }
    if (v.crateras) {
      [[76, 80, 10], [122, 68, 7], [110, 122, 13], [68, 124, 6], [142, 104, 5]].forEach(function (k) {
        deco += '<circle cx="' + k[0] + '" cy="' + k[1] + '" r="' + k[2] + '" fill="' + s + '" opacity=".45"/>' +
          '<circle cx="' + (k[0] - 1.5) + '" cy="' + (k[1] - 1.5) + '" r="' + (k[2] * 0.7) + '" fill="' + mix(s, c, 0.45) + '" opacity=".55"/>';
      });
    }
    var moon = v.lua ? '<circle cx="168" cy="40" r="11" fill="#D8C4F0"/><circle cx="165" cy="37" r="3" fill="#C3A7EF"/><circle cx="171" cy="44" r="2" fill="#C3A7EF"/>' : '';
    return '<svg viewBox="0 0 200 200" aria-hidden="true" focusable="false">' +
      '<defs>' +
      '<radialGradient id="' + id + '-g" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="' + hl + '"/><stop offset=".5" stop-color="' + c + '"/><stop offset="1" stop-color="' + s + '"/></radialGradient>' +
      '<radialGradient id="' + id + '-glow"><stop offset=".55" stop-color="' + c + '" stop-opacity=".4"/><stop offset="1" stop-color="' + c + '" stop-opacity="0"/></radialGradient>' +
      '<clipPath id="' + id + '-c"><circle cx="100" cy="100" r="64"/></clipPath>' +
      '</defs>' +
      '<circle cx="100" cy="100" r="98" fill="url(#' + id + '-glow)"/>' +
      (v.anel ? ring(1, 0.55) : '') + (art.back || '') +
      '<circle cx="100" cy="100" r="64" fill="url(#' + id + '-g)"/>' +
      '<g clip-path="url(#' + id + '-c)">' + deco + '<circle cx="132" cy="132" r="72" fill="' + s + '" opacity=".22"/></g>' +
      '<circle cx="100" cy="100" r="64" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="2"/>' +
      (v.anel ? ring(0, 1) : '') + (art.front || '') + moon +
      '</svg>';
  }

  function avatarSVG(i) {
    var a = AVATARS[i] || AVATARS[0];
    var body = '<path d="M16 100c3-19 16-29 34-29s31 10 34 29z" fill="' + a.traje + '"/><circle cx="50" cy="86" r="5" fill="' + a.detalhe + '"/>';
    var head;
    if (a.tipo === 'robo') {
      head = '<line x1="50" y1="20" x2="50" y2="9" stroke="' + a.traje + '" stroke-width="3"/><circle cx="50" cy="8" r="4.5" fill="' + a.detalhe + '"/>' +
        '<rect x="22" y="20" width="56" height="48" rx="13" fill="' + a.traje + '"/>' +
        '<rect x="29" y="30" width="42" height="26" rx="8" fill="' + a.visor + '"/>' +
        '<rect x="36" y="38" width="8" height="8" rx="2" fill="' + a.detalhe + '"/><rect x="56" y="38" width="8" height="8" rx="2" fill="' + a.detalhe + '"/>' +
        '<path d="M42 51h16" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>' +
        '<rect x="16" y="36" width="6" height="14" rx="3" fill="' + a.detalhe + '"/><rect x="78" y="36" width="6" height="14" rx="3" fill="' + a.detalhe + '"/>';
    } else if (a.tipo === 'alien') {
      head = '<path d="M34 22 26 10M66 22l8-12" stroke="' + a.traje + '" stroke-width="3" stroke-linecap="round"/><circle cx="26" cy="9" r="4" fill="' + a.detalhe + '"/><circle cx="74" cy="9" r="4" fill="' + a.detalhe + '"/>' +
        '<ellipse cx="50" cy="44" rx="28" ry="27" fill="' + a.traje + '"/>' +
        '<ellipse cx="39" cy="42" rx="7" ry="9" fill="' + a.visor + '"/><ellipse cx="61" cy="42" rx="7" ry="9" fill="' + a.visor + '"/>' +
        '<circle cx="41" cy="39" r="2.5" fill="#fff"/><circle cx="63" cy="39" r="2.5" fill="#fff"/>' +
        '<path d="M43 57q7 5 14 0" stroke="' + a.visor + '" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
    } else {
      head = '<line x1="50" y1="18" x2="50" y2="9" stroke="' + a.traje + '" stroke-width="3"/><circle cx="50" cy="8" r="4.5" fill="' + a.detalhe + '"/>' +
        '<circle cx="50" cy="44" r="27" fill="' + a.traje + '"/>' +
        '<rect x="29" y="30" width="42" height="28" rx="14" fill="' + a.visor + '"/>' +
        '<circle cx="41" cy="43" r="4" fill="#fff"/><circle cx="59" cy="43" r="4" fill="#fff"/>' +
        '<path d="M43 50q7 5 14 0" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
        '<path d="M35 36q4-4 10-4" stroke="#fff" stroke-opacity=".45" stroke-width="3" fill="none" stroke-linecap="round"/>';
    }
    return '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false"><circle cx="50" cy="50" r="50" fill="' + a.fundo + '"/>' + body + head + '</svg>';
  }

  /* ---------- Topo ---------- */
  function renderHeader() {
    var p = points(), sp = seloAtual(), nome = seloNome(sp);
    document.getElementById('avatarBtn').innerHTML = avatarSVG(state.avatar);
    var tier = document.getElementById('tierPill');
    tier.innerHTML = (sp ? '<span class="pill-planet">' + planetSVG(sp, 'pill') + '</span>' : ic('rocket')) + '<span>' + esc(nome.toUpperCase()) + '</span>';
    tier.setAttribute('aria-label', 'Selo ' + nome);
    tier.setAttribute('role', 'img');
    var pts = document.getElementById('pointsPill');
    pts.innerHTML = STAR + '<span>' + p.toLocaleString('pt-BR') + '</span>';
    pts.setAttribute('aria-label', p + ' estrelas');
    pts.setAttribute('role', 'img');
  }

  /* ---------- Cards de material ---------- */
  function fmtBadge(f) {
    var k = fmtKey(f);
    return '<span class="fmt fmt-' + k + '" aria-hidden="true">' + ic(k === 'video' ? 'video' : k) + '<b>' + FORMATS[k].label + '</b></span>';
  }
  function videoBlock(m) {
    if (!isReady(m.video)) return '<div class="video-soon">' + ic('video') + 'Vídeo em breve</div>';
    var e = toEmbed(m.video);
    if (!e) return '<a class="btn btn-ghost" href="' + esc(m.video) + '" target="_blank" rel="noopener">' + ic('video') + 'Assistir ao vídeo</a>';
    return '<div class="video"><iframe src="' + esc(e) + '" title="Vídeo: ' + esc(m.titulo) + '" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>';
  }
  function materialCard(m, opts) {
    opts = opts || {};
    var ready = isReady(m.link);
    var meta = esc(m.formato);
    if (opts.lib && m.nivel) meta += ' · ' + esc(m.nivel.dia);
    var seen = state.opened[m.id] ? ' · <span class="seen">✓ aberto</span>' : '';
    var actions;
    if (ready) {
      actions = '<a class="btn btn-primary" href="' + esc(m.link) + '" target="_blank" rel="noopener" data-open="' + esc(m.id) + '">' + ic('external') + 'Abrir material<span class="sr-only"> (abre em nova aba)</span></a>';
      if (toEmbed(m.link)) actions += '<button type="button" class="btn btn-ghost" data-preview="' + esc(m.id) + '" aria-expanded="false" aria-controls="pv-' + esc(m.id) + '">' + ic('eye') + 'Pré-visualizar</button>';
    } else {
      actions = '<span class="btn btn-disabled" aria-disabled="true">Em breve</span>';
    }
    var video = opts.lib ? (isReady(m.video) ? '<p class="mmeta">' + ic('video') + ' Tem vídeo</p>' : '') : videoBlock(m);
    var trail = (opts.lib && m.nivel) ? '<a class="mlink" href="#/nivel/' + esc(m.nivel.id) + '">Ver na trilha: ' + esc(m.nivel.tema) + ' →</a>' : '';
    return '<article class="mcard' + (ready ? '' : ' is-soon') + '">' +
      '<div class="mcard-head">' + fmtBadge(m.formato) +
      '<div><h3>' + esc(m.titulo) + '</h3><p class="mmeta" data-mmeta="' + esc(m.id) + '">' + meta + seen + '</p></div>' +
      (ready ? '' : '<span class="soon-tag">Em breve</span>') + '</div>' +
      '<p class="mdesc">' + esc(m.descricao) + '</p>' +
      video +
      '<div class="mactions">' + actions + '</div>' + trail +
      '<div class="preview" id="pv-' + esc(m.id) + '" hidden></div>' +
      '</article>';
  }

  /* ---------- Tela: Início ---------- */
  function renderHome(dir) {
    var ps = DATA.planetas;
    if (homeIdx == null) {
      var i = -1;
      ps.some(function (p, k) { if (planetDone(p) < p.niveis.length) { i = k; return true; } return false; });
      homeIdx = i < 0 ? 0 : i;
    }
    var p = ps[homeIdx];
    var dots = ps.map(function (q, k) {
      return '<button type="button" data-action="goto" data-i="' + k + '" aria-label="Planeta ' + (k + 1) + ': ' + esc(q.nome) + '"' + (k === homeIdx ? ' aria-current="true"' : '') + '></button>';
    }).join('');
    return '<section class="home" aria-label="Planetas da trilha">' +
      '<h1 class="sr-only">' + esc(DATA.config.titulo) + '</h1>' +
      '<div class="carousel">' +
      '<button type="button" class="arrow arrow-prev" data-action="prev" aria-label="Planeta anterior"' + (homeIdx === 0 ? ' disabled' : '') + '><svg viewBox="0 0 24 24" aria-hidden="true">' + ICONS.arrowL + '</svg></button>' +
      '<div class="planet-stage' + (dir ? ' slide-' + dir : '') + '">' +
      '<div class="planet-art float" role="img" aria-label="Ilustração do planeta ' + esc(p.nome) + '">' + planetSVG(p, 'home') + '</div>' +
      '<p class="kicker">Planeta ' + (homeIdx + 1) + ' · ' + esc(p.periodo) + '</p>' +
      '<h2 class="planet-name">' + esc(p.nome) + '</h2>' +
      '<p class="planet-desc">' + esc(p.descricao) + '</p>' +
      '<span class="level-pill">' + ic('rocket') + planetDone(p) + '/' + p.niveis.length + ' NÍVEIS</span>' +
      '<a class="btn-explore" href="#/planeta/' + esc(p.id) + '">EXPLORAR</a>' +
      '<p class="counter" aria-live="polite">' + (homeIdx + 1) + ' DE ' + ps.length + ' PLANETAS</p>' +
      '<div class="dots">' + dots + '</div>' +
      '</div>' +
      '<button type="button" class="arrow arrow-next" data-action="next" aria-label="Próximo planeta"' + (homeIdx === ps.length - 1 ? ' disabled' : '') + '><svg viewBox="0 0 24 24" aria-hidden="true">' + ICONS.arrowR + '</svg></button>' +
      '</div></section>';
  }
  function homeGo(delta, absolute) {
    var n = DATA.planetas.length;
    var target = absolute != null ? absolute : homeIdx + delta;
    if (target < 0 || target >= n || target === homeIdx) return;
    var dir = target > homeIdx ? 'next' : 'prev';
    homeIdx = target;
    main.innerHTML = renderHome(dir);
  }

  /* ---------- Tela: Planeta ---------- */
  function renderPlanet(id) {
    var p = DATA.planetas.filter(function (x) { return x.id === id; })[0];
    if (!p) return notFound();
    homeIdx = p.index;
    var done = planetDone(p), total = p.niveis.length;
    var prevP = DATA.planetas[p.index - 1], nextP = DATA.planetas[p.index + 1];
    var steps = p.niveis.map(function (n) {
      var st = levelStatus(n), S = STATUS[st];
      var nMat = n.materiais.length;
      return '<li class="step is-' + st + '"><a class="step-link" href="#/nivel/' + esc(n.id) + '">' +
        '<span class="node" aria-hidden="true">' + (st === 'open' ? (n.index + 1) : ic(S.icon)) + '</span>' +
        '<span class="step-card">' +
        '<span class="step-day">' + esc(n.dia) + '</span>' +
        '<span class="step-title">' + esc(n.tema) + '</span>' +
        '<span class="step-foot"><span class="chip chip-' + st + '">' + ic(S.icon) + S.label + '</span>' +
        '<span>' + (nMat ? nMat + (nMat === 1 ? ' material' : ' materiais') : 'Atividade com a banca') + '</span></span>' +
        '</span></a></li>';
    }).join('');
    return '<section class="wrap page">' +
      '<a class="back" href="#/inicio">' + ic('arrowL') + 'Voltar aos planetas</a>' +
      '<header class="planet-head">' +
      '<div class="planet-mini">' + planetSVG(p, 'head') + '</div>' +
      '<div><p class="kicker">Planeta ' + (p.index + 1) + ' de ' + DATA.planetas.length + ' · ' + esc(p.periodo) + '</p>' +
      '<h1>' + esc(p.nome) + '</h1><p class="lead">' + esc(p.descricao) + '</p>' +
      progressBar(done, total, 'Níveis concluídos em ' + p.nome) +
      '<p class="small">' + done + '/' + total + ' níveis concluídos</p></div>' +
      '</header>' +
      '<p class="hint">A ordem é sugerida. Os níveis marcados como bloqueados também podem ser abertos quando você quiser.</p>' +
      '<h2 class="sr-only">Níveis</h2><ol class="path">' + steps + '</ol>' +
      '<nav class="pager" aria-label="Outros planetas">' +
      (prevP ? '<a class="back" href="#/planeta/' + esc(prevP.id) + '">' + ic('arrowL') + esc(prevP.nome) + '</a>' : '<span></span>') +
      (nextP ? '<a class="back" href="#/planeta/' + esc(nextP.id) + '">' + esc(nextP.nome) + ic('arrowR') + '</a>' : '') +
      '</nav></section>';
  }
  function progressBar(v, max, label, light) {
    var pct = max ? Math.round((v / max) * 100) : 0;
    return '<div class="progress' + (light ? ' on-light' : '') + '" role="progressbar" aria-valuemin="0" aria-valuemax="' + max + '" aria-valuenow="' + v + '" aria-label="' + esc(label) + '"><span style="width:' + pct + '%"></span></div>';
  }

  /* ---------- Tela: Nível ---------- */
  function renderLevel(id) {
    var n = LEVELS.filter(function (l) { return l.id === id; })[0];
    if (!n) return notFound();
    var p = n.planeta;
    homeIdx = p.index;
    var st = levelStatus(n), S = STATUS[st];
    var isDone = st === 'done';
    var prev = LEVELS[n.gIndex - 1], next = LEVELS[n.gIndex + 1];
    var mats = n.materiais.length
      ? '<div class="mgrid">' + n.materiais.map(function (m) { return materialCard(m); }).join('') + '</div>'
      : '<div class="empty">Este dia não tem materiais de leitura: é uma atividade de aferição acompanhada pela banca. Prepare-se revendo os planetas anteriores e a Biblioteca.</div>';
    return '<section class="wrap page">' +
      '<a class="back" href="#/planeta/' + esc(p.id) + '">' + ic('arrowL') + esc(p.nome) + '</a>' +
      '<header class="level-head">' +
      '<p class="kicker">Planeta ' + (p.index + 1) + ' · ' + esc(p.nome) + ' · ' + esc(n.dia) + '</p>' +
      '<h1>' + esc(n.tema) + '</h1>' +
      '<span class="chip chip-' + st + '">' + ic(S.icon) + S.label + '</span>' +
      '</header>' +
      '<div class="info-grid">' +
      '<div class="info"><h2>' + ic('target') + 'Atividade do dia</h2><p>' + esc(n.atividade) + '</p></div>' +
      '<div class="info"><h2>' + ic('inbox') + 'Entregável</h2><p>' + esc(n.entregavel) + '</p></div>' +
      '</div>' +
      '<h2 class="section-title">Materiais</h2>' + mats +
      '<div class="done-bar">' +
      '<button type="button" class="btn-done' + (isDone ? ' is-done' : '') + '" data-action="toggle-done" data-id="' + esc(n.id) + '" aria-pressed="' + isDone + '">' +
      (isDone ? ic('check') + 'Nível concluído' : 'Marcar como concluído') + '</button>' +
      '<p class="small">' + (isDone ? 'Clique de novo se quiser desmarcar.' : 'Vale +' + DATA.config.pontos.nivel + ' estrelas.') + '</p>' +
      '</div>' +
      '<nav class="pager" aria-label="Outros níveis">' +
      (prev ? '<a class="back" href="#/nivel/' + esc(prev.id) + '">' + ic('arrowL') + esc(prev.dia) + '</a>' : '<span></span>') +
      (next ? '<a class="back" href="#/nivel/' + esc(next.id) + '">' + esc(next.dia) + ic('arrowR') + '</a>' : '') +
      '</nav></section>';
  }

  /* ---------- Tela: Minha trilha ---------- */
  function renderProgress() {
    var total = LEVELS.length;
    var done = LEVELS.filter(function (l) { return state.done[l.id]; }).length;
    var pct = total ? Math.round((done / total) * 100) : 0;
    var uniq = {};
    MATERIALS.forEach(function (m) { uniq[m.id] = true; });
    var matTotal = Object.keys(uniq).length;
    var matOpen = Object.keys(uniq).filter(function (k) { return state.opened[k]; }).length;
    var p = points();
    var C = 2 * Math.PI * 64;
    var selos = DATA.planetas.map(function (pl) {
      var ok = planetComplete(pl);
      return '<li class="selo' + (ok ? ' is-on' : '') + '">' +
        '<span class="selo-art">' + planetSVG(pl, 'selo') + (ok ? '' : '<span class="selo-lock">' + ic('lock') + '</span>') + '</span>' +
        '<strong>' + esc(seloNome(pl)) + '</strong>' +
        '<span>' + (ok ? 'Conquistado' : 'Conclua ' + esc(pl.nome)) + '</span></li>';
    }).join('');
    var rows = DATA.planetas.map(function (pl) {
      var d = planetDone(pl);
      return '<a class="prow" href="#/planeta/' + esc(pl.id) + '">' +
        '<span class="prow-planet">' + planetSVG(pl, 'row') + '</span>' +
        '<span><strong>' + esc(pl.nome) + '</strong><span class="small">' + esc(pl.periodo) + '</span>' +
        progressBar(d, pl.niveis.length, 'Níveis concluídos em ' + pl.nome) + '</span>' +
        '<span class="prow-count">' + d + '/' + pl.niveis.length + ' níveis</span></a>';
    }).join('');
    return '<section class="wrap page">' +
      '<p class="kicker">Seu progresso</p><h1>Minha trilha</h1>' +
      '<p class="lead">Acompanhe quanto da trilha você já percorreu, suas estrelas e o seu selo.</p>' +
      '<div class="stats-hero">' +
      '<div class="ring" role="img" aria-label="' + pct + '% da trilha concluída">' +
      '<svg viewBox="0 0 150 150" aria-hidden="true"><circle cx="75" cy="75" r="64" fill="none" stroke="#E6E9F4" stroke-width="14"/>' +
      '<circle cx="75" cy="75" r="64" fill="none" stroke="#3CC3B5" stroke-width="14" stroke-linecap="round" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + (C * (1 - pct / 100)).toFixed(1) + '"/></svg>' +
      '<b>' + pct + '%</b></div>' +
      '<div class="stat-grid">' +
      '<div class="stat"><b>' + done + '/' + total + '</b><span>níveis concluídos</span></div>' +
      '<div class="stat"><b>' + matOpen + '/' + matTotal + '</b><span>materiais abertos</span></div>' +
      '<div class="stat"><b>' + p.toLocaleString('pt-BR') + '</b><span>estrelas</span></div>' +
      '<div class="stat"><b>' + esc(seloNome(seloAtual())) + '</b><span>selo atual</span></div>' +
      '</div>' +
      '</div>' +
      '<h2 class="section-title">Seus selos</h2><ul class="selos">' + selos + '</ul>' +
      '<h2 class="section-title">Níveis por planeta</h2><div class="planet-rows">' + rows + '</div>' +
      '<div class="reset-box"><h2 class="section-title" style="margin-top:0">Recomeçar</h2>' +
      '<p class="small">Apaga os níveis concluídos, os materiais abertos e as estrelas deste navegador.</p>' +
      '<p><button type="button" class="btn btn-danger" data-action="reset">Zerar progresso</button></p></div>' +
      '</section>';
  }

  /* ---------- Tela: Biblioteca ---------- */
  function renderLibrary() {
    var mods = [], fmts = [];
    MATERIALS.forEach(function (m) {
      if (mods.indexOf(m.modulo) === -1) mods.push(m.modulo);
      var k = fmtKey(m.formato);
      if (fmts.indexOf(k) === -1) fmts.push(k);
    });
    function opt(v, label, cur) { return '<option value="' + esc(v) + '"' + (v === cur ? ' selected' : '') + '>' + esc(label) + '</option>'; }
    return '<section class="wrap page">' +
      '<p class="kicker">Consulta rápida</p><h1>Biblioteca</h1>' +
      '<p class="lead">Todos os materiais da trilha em um só lugar, para consultar fora da ordem dos planetas.</p>' +
      '<form class="filters" role="search" onsubmit="return false">' +
      '<label>Buscar por nome<input type="search" id="fq" placeholder="Ex.: objeções, CRM, pitch" value="' + esc(libFilters.q) + '" autocomplete="off"></label>' +
      '<label>Módulo<select id="fmod">' + opt('', 'Todos os módulos', libFilters.mod) + mods.map(function (m) { return opt(m, m, libFilters.mod); }).join('') + '</select></label>' +
      '<label>Formato<select id="ffmt">' + opt('', 'Todos os formatos', libFilters.fmt) + fmts.map(function (k) { return opt(k, FORMATS[k].nome, libFilters.fmt); }).join('') + '</select></label>' +
      '</form>' +
      '<p id="libCount" class="small" aria-live="polite"></p>' +
      '<div id="libGrid" class="mgrid"></div>' +
      '</section>';
  }
  function updateLibrary() {
    var q = plain(libFilters.q).trim();
    var seen = {};
    var list = MATERIALS.filter(function (m) {
      if (seen[m.id]) return false;
      seen[m.id] = true;
      if (libFilters.mod && m.modulo !== libFilters.mod) return false;
      if (libFilters.fmt && fmtKey(m.formato) !== libFilters.fmt) return false;
      if (q && plain(m.titulo + ' ' + m.descricao).indexOf(q) === -1) return false;
      return true;
    });
    document.getElementById('libGrid').innerHTML = list.length
      ? list.map(function (m) { return materialCard(m, { lib: true }); }).join('')
      : '<div class="empty">Nenhum material encontrado. Tente outra palavra ou limpe os filtros.</div>';
    document.getElementById('libCount').textContent = list.length + (list.length === 1 ? ' material encontrado' : ' materiais encontrados');
  }
  function bindLibrary() {
    var fq = document.getElementById('fq'), fm = document.getElementById('fmod'), ff = document.getElementById('ffmt');
    fq.addEventListener('input', function () { libFilters.q = fq.value; updateLibrary(); });
    fm.addEventListener('change', function () { libFilters.mod = fm.value; updateLibrary(); });
    ff.addEventListener('change', function () { libFilters.fmt = ff.value; updateLibrary(); });
    updateLibrary();
  }

  /* ---------- Tela: Como funciona ---------- */
  function renderHelp() {
    var c = DATA.config;
    var selos = '<li><strong>' + esc(c.seloInicial) + '</strong>: no começo da trilha</li>' +
      DATA.planetas.map(function (p) { return '<li><strong>' + esc(seloNome(p)) + '</strong>: ao concluir ' + esc(p.nome) + '</li>'; }).join('');
    var planetas = DATA.planetas.map(function (p) { return '<li><strong>' + esc(p.nome) + '</strong> — ' + esc(p.periodo) + '</li>'; }).join('');
    return '<section class="wrap page">' +
      '<p class="kicker">Guia rápido</p><h1>Como funciona</h1>' +
      '<p class="lead">Esta é a sua trilha de entrada no time comercial da Jovens Gênios. Cada planeta é uma etapa e cada nível é um dia de trabalho.</p>' +
      '<div class="info-cards">' +
      '<div class="icard"><h2><span class="badge-num">1</span>A jornada</h2>' +
      '<p>São <strong>2 semanas de estudo e prática</strong> e <strong>1 semana de aferição</strong>.</p><ol>' + planetas + '</ol></div>' +
      '<div class="icard"><h2><span class="badge-num">2</span>Cada dia</h2>' +
      '<p>Abra o planeta, escolha o nível do dia e siga três passos:</p><ul>' +
      '<li>Leia ou assista aos <strong>materiais</strong> (eles abrem no Google Drive).</li>' +
      '<li>Faça a <strong>atividade do dia</strong>.</li>' +
      '<li>Entregue o <strong>entregável</strong> para a sua liderança e clique em <strong>Marcar como concluído</strong>.</li></ul>' +
      '<p>A ordem é sugerida, mas você pode abrir qualquer nível a qualquer momento.</p></div>' +
      '<div class="icard"><h2><span class="badge-num">3</span>Estrelas e selos</h2><ul>' +
      '<li><strong>+' + c.pontos.material + ' estrelas</strong> por material aberto</li>' +
      '<li><strong>+' + c.pontos.nivel + ' estrelas</strong> por nível concluído</li></ul>' +
      '<p>Selos:</p><ul>' + selos + '</ul>' +
      '<p>Ao concluir todos os níveis de um planeta, você recebe uma recompensa e conquista o selo daquele planeta.</p></div>' +
      '<div class="icard warn"><h2><span class="badge-num">!</span>Onde fica o progresso</h2>' +
      '<p>O seu progresso fica salvo <strong>só neste navegador, neste aparelho</strong>. Não há cadastro nem login.</p>' +
      '<p>Se você trocar de computador, usar outro navegador, abrir uma janela anônima ou limpar os dados de navegação, o progresso não vai junto.</p></div>' +
      '</div></section>';
  }

  function notFound() {
    return '<section class="wrap page"><h1>Página não encontrada</h1><p class="lead">Esse endereço não existe na trilha.</p><a class="back" href="#/inicio">' + ic('arrowL') + 'Voltar ao início</a></section>';
  }

  /* ---------- Roteamento ---------- */
  var NAV_OF = { inicio: 'inicio', planeta: 'inicio', nivel: 'inicio', trilha: 'trilha', biblioteca: 'biblioteca', 'como-funciona': 'como-funciona' };
  var TITLES = { trilha: 'Minha trilha', biblioteca: 'Biblioteca', 'como-funciona': 'Como funciona' };

  function route(keepPosition) {
    var parts = (location.hash.replace(/^#\/?/, '') || 'inicio').split('/');
    var page = NAV_OF[parts[0]] ? parts[0] : 'inicio';
    var arg = decodeURIComponent(parts[1] || '');
    var html, title = '';
    if (page === 'planeta') { html = renderPlanet(arg); var pp = DATA.planetas[homeIdx]; title = pp ? pp.nome : ''; }
    else if (page === 'nivel') { html = renderLevel(arg); var lv = LEVELS.filter(function (l) { return l.id === arg; })[0]; title = lv ? lv.tema : ''; }
    else if (page === 'trilha') html = renderProgress();
    else if (page === 'biblioteca') html = renderLibrary();
    else if (page === 'como-funciona') html = renderHelp();
    else html = renderHome();
    title = title || TITLES[page] || '';

    main.innerHTML = html;
    main.setAttribute('data-page', page);
    if (page === 'biblioteca') bindLibrary();

    var nav = NAV_OF[page];
    Array.prototype.forEach.call(document.querySelectorAll('[data-nav]'), function (a) {
      var on = a.getAttribute('data-nav') === nav;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    document.title = (title ? title + ' · ' : '') + DATA.config.titulo;

    if (!firstRender && !keepPosition) {
      window.scrollTo(0, 0);
      main.focus({ preventScroll: true });
    }
    firstRender = false;
  }

  /* ---------- Ações ---------- */
  function announce(t) {
    var el = document.getElementById('live');
    el.textContent = '';
    setTimeout(function () { el.textContent = t; }, 30);
  }
  function toast(t) {
    var el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('aria-hidden', 'true');
    el.textContent = t;
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 1900);
  }

  function markOpened(id) {
    if (state.opened[id]) return;
    state.opened[id] = Date.now();
    save();
    renderHeader();
    var pts = DATA.config.pontos.material;
    toast('+' + pts + ' ★');
    announce('Material aberto: mais ' + pts + ' estrelas.');
    Array.prototype.forEach.call(document.querySelectorAll('[data-mmeta="' + id + '"]'), function (el) {
      if (!el.querySelector('.seen')) el.insertAdjacentHTML('beforeend', ' · <span class="seen">✓ aberto</span>');
    });
  }

  function togglePreview(btn) {
    var id = btn.getAttribute('data-preview');
    var box = document.getElementById('pv-' + id);
    var m = MATERIALS.filter(function (x) { return x.id === id; })[0];
    if (!box || !m) return;
    var open = box.hidden;
    if (open && !box.firstChild) {
      box.innerHTML = '<iframe src="' + esc(toEmbed(m.link)) + '" title="Pré-visualização: ' + esc(m.titulo) + '" loading="lazy" allow="autoplay; fullscreen" allowfullscreen></iframe>';
    }
    box.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    btn.innerHTML = ic('eye') + (open ? 'Fechar pré-visualização' : 'Pré-visualizar');
    if (open) markOpened(id);
  }

  function toggleDone(id) {
    var n = LEVELS.filter(function (l) { return l.id === id; })[0];
    if (!n) return;
    var nowDone = !state.done[id];
    if (nowDone) state.done[id] = Date.now(); else delete state.done[id];
    save();
    renderHeader();
    var y = window.scrollY;
    route(true);
    window.scrollTo(0, y);
    var btn = main.querySelector('[data-action="toggle-done"]');
    if (btn) btn.focus({ preventScroll: true });
    if (nowDone) {
      toast('+' + DATA.config.pontos.nivel + ' ★');
      announce('Nível concluído: mais ' + DATA.config.pontos.nivel + ' estrelas.');
      var p = n.planeta;
      if (planetDone(p) === p.niveis.length && !state.rewarded[p.id]) {
        state.rewarded[p.id] = Date.now();
        save();
        setTimeout(function () { openReward(p); }, 350);
      }
    } else {
      announce('Nível desmarcado.');
    }
  }

  function cycleFont(step) {
    state.font = step != null ? step : (state.font + 1) % FONT_STEPS.length;
    save();
    applyFont();
    announce('Tamanho da fonte: ' + Math.round(FONT_STEPS[state.font] * 100) + '%');
  }
  function applyFont() {
    var f = FONT_STEPS[state.font] || 1;
    document.documentElement.style.fontSize = (f * 100) + '%';
    var b = document.getElementById('a11yBtn');
    b.setAttribute('data-level', String(state.font));
    var nextF = FONT_STEPS[(state.font + 1) % FONT_STEPS.length];
    b.setAttribute('aria-label', (nextF > f ? 'Aumentar' : 'Voltar') + ' o tamanho da fonte (atual: ' + Math.round(f * 100) + '%)');
    b.title = b.getAttribute('aria-label');
  }

  /* ---------- Modais ---------- */
  var BG = ['.topbar', '#main', '.bottom-nav', '#a11yBtn'];
  function openModal(html) {
    lastFocus = document.activeElement;
    var root = document.getElementById('modalRoot');
    root.innerHTML = '<div class="backdrop" data-backdrop><div class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle" tabindex="-1">' + html + '</div></div>';
    document.body.classList.add('has-modal');
    BG.forEach(function (s) { var el = document.querySelector(s); if (el) el.setAttribute('inert', ''); });
    var first = root.querySelector('.modal button, .modal a');
    (first || root.querySelector('.modal')).focus();
  }
  function closeModal() {
    var root = document.getElementById('modalRoot');
    if (!root.firstChild) return;
    root.innerHTML = '';
    document.body.classList.remove('has-modal');
    BG.forEach(function (s) { var el = document.querySelector(s); if (el) el.removeAttribute('inert'); });
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
  }
  function openAvatarPicker() {
    var opts = AVATARS.map(function (a, i) {
      return '<button type="button" class="avatar-opt" data-action="pick-avatar" data-i="' + i + '" aria-pressed="' + (i === state.avatar) + '">' + avatarSVG(i) + esc(a.nome) + '</button>';
    }).join('');
    openModal('<p class="kicker">Seu perfil</p><h2 id="modalTitle">Escolha o seu avatar</h2>' +
      '<div class="avatar-grid">' + opts + '</div>' +
      '<div class="modal-actions"><button type="button" class="btn btn-ghost" data-action="close-modal">Fechar</button></div>');
  }
  function openReward(p) {
    var next = DATA.planetas[p.index + 1];
    var all = planetsCompleted() === DATA.planetas.length;
    var stars = '';
    for (var i = 0; i < 16; i++) stars += '<i style="--a:' + (i * 22.5) + 'deg;--d:' + ((i % 4) * 0.07) + 's"></i>';
    var actions = next && !all
      ? '<a class="btn btn-primary" href="#/planeta/' + esc(next.id) + '" data-action="close-modal">Ir para ' + esc(next.nome) + ic('arrowR') + '</a>'
      : '<a class="btn btn-primary" href="#/trilha" data-action="close-modal">Ver minha trilha</a>';
    openModal('<div class="burst" aria-hidden="true">' + stars + '</div>' +
      '<div class="reward-planet">' + planetSVG(p, 'reward') + '</div>' +
      '<p class="kicker">Recompensa</p>' +
      '<h2 id="modalTitle">' + (all ? 'Trilha concluída!' : 'Planeta ' + esc(p.nome) + ' concluído!') + '</h2>' +
      '<p>' + (all
        ? 'Você completou todos os planetas da trilha. Agora é com você em campo!'
        : 'Você completou os ' + p.niveis.length + ' níveis deste planeta e conquistou o selo <strong>' + esc(seloNome(p)) + '</strong>.') + '</p>' +
      '<div class="modal-actions">' + actions + '<button type="button" class="btn btn-ghost" data-action="close-modal">Continuar aqui</button></div>');
  }
  function confirmReset() {
    openModal('<p class="kicker">Atenção</p><h2 id="modalTitle">Zerar o progresso?</h2>' +
      '<p>Isso apaga os níveis concluídos, os materiais abertos e as estrelas salvos neste navegador. Não dá para desfazer.</p>' +
      '<div class="modal-actions"><button type="button" class="btn btn-ghost" data-action="close-modal">Cancelar</button>' +
      '<button type="button" class="btn btn-danger-solid" data-action="do-reset">Sim, zerar</button></div>');
  }

  /* ---------- Eventos ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target;
    var op = t.closest('[data-open]');
    if (op) { markOpened(op.getAttribute('data-open')); return; }
    var pv = t.closest('[data-preview]');
    if (pv) { togglePreview(pv); return; }
    if (t.hasAttribute && t.hasAttribute('data-backdrop')) { closeModal(); return; }
    var a = t.closest('[data-action]');
    if (!a) return;
    switch (a.getAttribute('data-action')) {
      case 'prev': homeGo(-1); focusArrow('prev'); break;
      case 'next': homeGo(1); focusArrow('next'); break;
      case 'goto': homeGo(0, +a.getAttribute('data-i')); var d = main.querySelector('.dots [aria-current]'); if (d) d.focus(); break;
      case 'toggle-done': toggleDone(a.getAttribute('data-id')); break;
      case 'avatar': openAvatarPicker(); break;
      case 'pick-avatar':
        state.avatar = +a.getAttribute('data-i'); save(); renderHeader(); closeModal();
        announce('Avatar alterado para ' + AVATARS[state.avatar].nome + '.');
        break;
      case 'font': cycleFont(); break;
      case 'reset': confirmReset(); break;
      case 'do-reset':
        state.done = {}; state.opened = {}; state.rewarded = {}; save();
        closeModal(); renderHeader(); route(true); announce('Progresso zerado.');
        break;
      case 'close-modal': closeModal(); break;
    }
  });
  // Clique com o botão do meio também conta como material aberto
  document.addEventListener('auxclick', function (e) {
    var op = e.target.closest && e.target.closest('[data-open]');
    if (op && e.button === 1) markOpened(op.getAttribute('data-open'));
  });
  function focusArrow(which) {
    var b = main.querySelector('[data-action="' + which + '"]');
    if (b && b.disabled) b = main.querySelector('[data-action="' + (which === 'next' ? 'prev' : 'next') + '"]');
    if (b) b.focus();
  }

  document.addEventListener('keydown', function (e) {
    var modal = document.querySelector('#modalRoot .modal');
    if (modal) {
      if (e.key === 'Escape') { closeModal(); return; }
      if (e.key === 'Tab') {
        var f = modal.querySelectorAll('button, a[href], input, select, [tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
      return;
    }
    if (main.getAttribute('data-page') === 'inicio' && !/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) {
      if (e.key === 'ArrowLeft') { homeGo(-1); }
      if (e.key === 'ArrowRight') { homeGo(1); }
    }
  });

  // Deslizar o dedo no celular troca de planeta
  var touchX = null;
  main.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
  main.addEventListener('touchend', function (e) {
    if (touchX == null || main.getAttribute('data-page') !== 'inicio') return;
    var dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) > 50) homeGo(dx < 0 ? 1 : -1);
  }, { passive: true });

  window.addEventListener('hashchange', function () { closeModal(); route(); });

  /* ---------- Estrelas do fundo ---------- */
  function makeStars() {
    var el = document.querySelector('.stars');
    var n = window.innerWidth < 600 ? 80 : 160, h = '';
    for (var i = 0; i < n; i++) {
      var s = (Math.random() * 1.8 + 0.6).toFixed(1);
      var tw = Math.random() < 0.25;
      h += '<i class="' + (tw ? 'tw' : '') + '" style="left:' + (Math.random() * 100).toFixed(2) + '%;top:' + (Math.random() * 100).toFixed(2) + '%;width:' + s + 'px;height:' + s + 'px;' + (tw ? 'animation-delay:' + (Math.random() * 4).toFixed(1) + 's' : '') + '"></i>';
    }
    el.innerHTML = h;
  }

  /* ---------- Carregamento dos dados ---------- */
  function prepare(d) {
    d.config = d.config || {};
    d.config.titulo = d.config.titulo || 'Trilha do Consultor JG';
    d.config.pontos = d.config.pontos || { material: 10, nivel: 30 };
    d.config.seloInicial = d.config.seloInicial || 'Decolagem';
    d.planetas = d.planetas || [];
    LEVELS = []; MATERIALS = [];
    d.planetas.forEach(function (p, pi) {
      p.index = pi;
      p.niveis = p.niveis || [];
      p.niveis.forEach(function (n, ni) {
        n.planeta = p; n.index = ni; n.gIndex = LEVELS.length;
        n.materiais = n.materiais || [];
        LEVELS.push(n);
        n.materiais.forEach(function (m) {
          m.nivel = n;
          m.modulo = m.modulo || p.nome;
          MATERIALS.push(m);
        });
      });
    });
    (d.complementares || []).forEach(function (m) {
      m.modulo = m.modulo || 'Complementares';
      MATERIALS.push(m);
    });
    return d;
  }

  function showError(msg) {
    main.innerHTML = '<div class="error-box" role="alert"><h1 style="margin-top:0;font-size:1.3rem">Não foi possível carregar a trilha</h1>' + msg + '</div>';
  }

  makeStars();
  applyFont();

  fetch('data/trilha.json', { cache: 'no-cache' })
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.text();
    })
    .then(function (txt) {
      try {
        DATA = prepare(JSON.parse(txt));
      } catch (err) {
        showError('<p>O arquivo <code>data/trilha.json</code> tem um erro de digitação. Confira vírgulas, aspas e chaves perto do ponto indicado abaixo.</p><p><code>' + esc(err.message) + '</code></p><p>Dica: cole o conteúdo do arquivo em <strong>jsonlint.com</strong> para encontrar a linha exata.</p>');
        return;
      }
      renderHeader();
      route();
    })
    .catch(function () {
      showError('<p>O arquivo <code>data/trilha.json</code> não foi encontrado ou não pôde ser lido.</p><p>Se você abriu o <code>index.html</code> direto do computador (dando dois cliques), o navegador bloqueia a leitura do arquivo. Publique o site (GitHub Pages ou Vercel) ou use um servidor local, como explicado no LEIA-ME.</p>');
    });
})();
