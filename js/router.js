/* ══════════════════════════════════════════════════════════════
   ROTEADOR — navegação por hash (#/p/plantao/inducao, #/e/preop/jejum, #/t)
   • botão "voltar" do celular volta de tela (history nativo)
   • módulos de estudo carregados sob demanda de modulos/<id>.html
   ══════════════════════════════════════════════════════════════ */
var APP_VERSION = '3.3.0';
var MODULOS = ['preop','farma','vm','monit','anesgeral','iot','vad','raqui','analgesia','volemia','avc','ped','srpa','crises','pocus','calc-clinica','obstetricia','fisiologia','cirurgias-esp','aparelho','etica','estatistica','dorcronica','nora','transplantes','traumaqueim','cardiaca','toracica','neuroanestesia'];
var _modCache = {};

function parseHash() { return location.hash.replace(/^#\/?/, '').split('/').filter(Boolean); }

function navigate(path, replace) {
  var url = '#/' + (path || '');
  if (url === '#/') url = '#/';
  if (replace) { history.replaceState(null, '', url); render(); return; }
  if (location.hash === url || (url === '#/' && location.hash === '')) { render(); return; }
  location.hash = url;            // dispara hashchange → render()
}

function activateScreen(id) {
  document.querySelectorAll('.screen.active').forEach(function (s) { s.classList.remove('active'); });
  var el = document.getElementById(id);
  if (!el) { el = document.getElementById('screen-launcher'); }
  el.classList.add('active');
  window.scrollTo(0, 0);
  if (typeof AG_STORE !== 'undefined') AG_STORE.set('lastHash', location.hash);
  return el;
}

function ensureModule(id) {
  if (document.getElementById('screen-' + id)) return Promise.resolve(true);
  if (MODULOS.indexOf(id) < 0) return Promise.resolve(false);
  if (_modCache[id]) return _modCache[id];
  var loader = document.getElementById('mod-loading');
  if (loader) loader.style.display = 'flex';
  _modCache[id] = fetch('modulos/' + id + '.html').then(function (r) {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.text();
  }).then(function (html) {
    document.getElementById('modulos-container').insertAdjacentHTML('beforeend', html);
    var scr = document.getElementById('screen-' + id);
    if (scr) scr.querySelectorAll('.app-version').forEach(function (e) { e.textContent = 'v' + APP_VERSION; });
    if (typeof afterModuleLoad === 'function') afterModuleLoad(id);
    return true;
  }).catch(function (e) {
    delete _modCache[id];
    if (typeof mostrarAviso === 'function') mostrarAviso('Não foi possível carregar o módulo. Verifique a conexão.');
    console.warn('módulo', id, e);
    return false;
  }).finally(function () { if (loader) loader.style.display = 'none'; });
  return _modCache[id];
}

function activateTab(screenEl, tabId) {
  var btn = screenEl.querySelector('.tab-bar .tab-btn[onclick*="\'' + tabId + '\'"]');
  if (!btn) return;
  var m = (btn.getAttribute('onclick') || '').match(/showTab\('([^']+)','([^']+)'/);
  if (m) showTab(m[1], m[2], btn, true);
}

function render() {
  var seg = parseHash();
  var id = 'screen-launcher';
  if (seg[0] === 'p') id = seg[1] ? 'screen-p-' + seg[1] : 'screen-p-home';
  else if (seg[0] === 'e') id = seg[1] ? 'screen-' + seg[1] : 'screen-home';
  else if (seg[0] === 't') id = 'screen-treino';
  var ready = (seg[0] === 'e' && seg[1]) ? ensureModule(seg[1]) : Promise.resolve(true);
  ready.then(function (ok) {
    var el = activateScreen(ok ? id : 'screen-home');
    updateNav(seg[0] || 'launcher');
    if (seg[2] && ok) activateTab(el, seg[2]);
    if (id === 'screen-treino' && typeof showTreinoHome === 'function') showTreinoHome(seg[1]);
  });
}

/* ── API usada pelos onclick do HTML (mantém nomes antigos) ── */
function enterMode(mode) { navigate(mode === 'pratico' ? 'p' : mode === 'treino' ? 't' : 'e'); }
function goToLauncher() { navigate(''); }
function goHome() { navigate('e'); }
function goTo(id) {
  if (id.indexOf('p-') === 0) navigate(id === 'p-home' ? 'p' : 'p/' + id.slice(2));
  else if (id === 'home') navigate('e');
  else navigate('e/' + id);
}

/* ── ABAS ── (replaceState: a aba fica no link, mas não polui o histórico) */
function showTab(prefix, id, btn, silent) {
  var targetPanel = document.getElementById(prefix + '-' + id);
  if (!targetPanel) return;
  var screen = targetPanel.closest('.screen');
  if (!screen) return;
  screen.querySelectorAll('.tab-panel').forEach(function (p) {
    if (p.id && p.id.indexOf(prefix + '-') === 0) p.classList.remove('active');
  });
  var tabBar = document.getElementById(prefix + '-tabbar') || screen.querySelector('.tab-bar');
  if (tabBar) tabBar.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
  targetPanel.classList.add('active');
  if (!btn && tabBar) btn = tabBar.querySelector('[onclick*="\'' + id + '\'"]');
  if (btn) { btn.classList.add('active'); btn.setAttribute('aria-selected', 'true'); if (btn.scrollIntoView) btn.scrollIntoView({ block: 'nearest', inline: 'center' }); }
  if (!silent) {
    var seg = parseHash();
    if (seg.length >= 2) history.replaceState(null, '', '#/' + seg[0] + '/' + seg[1] + '/' + id);
  }
  window.scrollTo(0, 0);
}

function updateNav(mode) {
  document.body.dataset.mode = mode;
  document.querySelectorAll('.bottom-nav button').forEach(function (b) { b.classList.toggle('on', b.dataset.mode === mode); b.setAttribute('aria-current', b.dataset.mode === mode ? 'page' : 'false'); });
}

function mostrarAviso(msg, ms) {
  var el = document.getElementById('app-toast');
  if (!el) return;
  el.textContent = msg; el.style.display = 'block';
  clearTimeout(el._t); el._t = setTimeout(function () { el.style.display = 'none'; }, ms || 3500);
}

window.addEventListener('hashchange', render);
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.app-version').forEach(function (e) { e.textContent = 'v' + APP_VERSION; });
  render();
});
