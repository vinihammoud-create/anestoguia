/* AG_STORE — armazenamento persistente (localStorage) com fallback em memória. */
var AG_STORE = (function () {
  var mem = {}, ok = false, P = 'ag:';
  try { localStorage.setItem('__ag', '1'); localStorage.removeItem('__ag'); ok = true; } catch (e) {}
  return {
    set: function (k, v) { mem[k] = v; if (ok) { try { localStorage.setItem(P + k, JSON.stringify(v)); } catch (e) {} } },
    get: function (k, fb) {
      if (Object.prototype.hasOwnProperty.call(mem, k)) return mem[k];
      if (ok) { try { var r = localStorage.getItem(P + k); if (r !== null) { mem[k] = JSON.parse(r); return mem[k]; } } catch (e) {} }
      return fb === undefined ? null : fb;
    },
    del: function (k) { delete mem[k]; if (ok) { try { localStorage.removeItem(P + k); } catch (e) {} } },
    persistente: ok
  };
})();
