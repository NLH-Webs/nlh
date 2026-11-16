/* nlh-track — touchpoint markup for every NhiLe website. Sends nothing anywhere.
 *
 * 1. Keeps the visitor's first utm_* and referrer for this tab (sessionStorage, the same
 *    keys nlh-contact reads), so a form sent later carries where the visitor came from.
 * 2. Every link to another NhiLe site gets utm_source=<this site>&utm_medium=web&utm_campaign=ecosystem
 *    and data-track="ecosystem" (unless the page already marked it).
 * 3. A click on any [data-track] element fires a 'nlh-track' DOM event with { track, cta, href },
 *    for whatever measurement Nếp settles on. No names, emails or phone numbers are ever included.
 *
 * Load with: <script src="/nlh/nlh-track.js" data-site="nhi.sg" defer></script>
 */
(function () {
  'use strict';
  var me = document.currentScript;
  var SITE = (me && me.getAttribute('data-site')) || location.hostname;
  var HOSTS = /(^|\.)(nhi\.sg|nlh\.vn|nedu\.vn|nlf\.sg|hieucon\.vn)$/;

  try {
    var q = new URLSearchParams(location.search);
    ['utm_source', 'utm_medium', 'utm_campaign'].forEach(function (k) {
      if (q.get(k) && !sessionStorage.getItem('nlh_' + k)) sessionStorage.setItem('nlh_' + k, q.get(k));
    });
    if (!sessionStorage.getItem('nlh_referrer')) sessionStorage.setItem('nlh_referrer', document.referrer || '(direct)');
  } catch (e) {}

  function mark(root) {
    Array.prototype.forEach.call((root || document).querySelectorAll('a[href^="http"]'), function (a) {
      var u;
      try { u = new URL(a.href); } catch (e) { return; }
      if (!HOSTS.test(u.hostname) || u.hostname === location.hostname) return;
      if (!u.searchParams.has('utm_source')) {
        u.searchParams.set('utm_source', SITE);
        u.searchParams.set('utm_medium', 'web');
        u.searchParams.set('utm_campaign', 'ecosystem');
        a.href = u.toString();
      }
      if (!a.hasAttribute('data-track')) a.setAttribute('data-track', 'ecosystem');
      if (!a.hasAttribute('data-cta')) a.setAttribute('data-cta', u.hostname);
    });
  }

  document.addEventListener('click', function (ev) {
    // composedPath also sees buttons inside a form's shadow DOM (nlh-contact).
    var path = ev.composedPath ? ev.composedPath() : [ev.target], el = null;
    for (var k = 0; k < path.length; k++) { if (path[k].getAttribute && path[k].hasAttribute('data-track')) { el = path[k]; break; } }
    if (!el) return;
    // Remember the last button that led the visitor on (not the form itself), so a form sent
    // later says which button brought them: nlh-contact sends it as entry_cta.
    if (el.tagName !== 'NLH-CONTACT' && el.getAttribute('data-cta')) {
      try { sessionStorage.setItem('nlh_entry_cta', el.getAttribute('data-cta')); } catch (e) {}
    }
    try {
      document.dispatchEvent(new CustomEvent('nlh-track', { detail: {
        site: SITE, track: el.getAttribute('data-track'), cta: el.getAttribute('data-cta') || '',
        href: el.getAttribute('href') || '', page: location.pathname
      } }));
    } catch (e) {}
  }, true);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { mark(); }); else mark();
})();
