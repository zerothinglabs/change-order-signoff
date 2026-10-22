/* zerothing beacon + PostHog + buy links. Do not remove or change the contract (see README). */
(function () {
  var src = document.currentScript && document.currentScript.src
  var base = src ? new URL('.', src).pathname : '/'
  var configUrl = src ? new URL('api/config', src).href : 'api/config'
  var eventUrl = src ? new URL('zt/e', src).href : 'zt/e'
  var buyUrl = src ? new URL('zt/buy', src).href : 'zt/buy'
  var phHost = new URL('zt/ph', src || location.href).href
  var config = null

  function vid() {
    try {
      var v = localStorage.getItem('zt_vid')
      if (!v) {
        v = crypto.randomUUID()
        localStorage.setItem('zt_vid', v)
      }
      return v
    } catch (e) {
      return window.__zt_vid || (window.__zt_vid = Math.random().toString(36).slice(2) + Date.now().toString(36))
    }
  }

  var ready = fetch(configUrl)
    .then(function (r) { return r.json() })
    .then(function (c) { config = c; return c })
    .catch(function () { return null })

  function send(name, props) {
    return ready.then(function (c) {
      if (!c) return
      var p = location.pathname
      if (p.indexOf(base) === 0) p = '/' + p.slice(base.length)
      var body = JSON.stringify({
        slug: c.slug, name: name, visitor_id: vid(), path: p,
        referrer: document.referrer || '', props: props || {}
      })
      var url = eventUrl
      var ok = false
      try { ok = navigator.sendBeacon && navigator.sendBeacon(url, body) } catch (e) {}
      if (!ok) {
        try { fetch(url, { method: 'POST', body: body, keepalive: true, headers: { 'content-type': 'text/plain' } }).catch(function () {}) } catch (e) {}
      }
    })
  }

  // PostHog through the first-party proxy `zt/ph`. Memory persistence: no cookies, no storage of its own.
  // The distinct id is the zt visitor id, so PostHog and hq events join.
  function loadPosthog(c) {
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],Object.defineProperty(u,"toString",{configurable:!0,enumerable:!0,writable:!0,value:function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e}}),Object.defineProperty(u.people,"toString",{configurable:!0,enumerable:!0,writable:!0,value:function(){return u.toString(1)+".people (stub)"}}),o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagResult isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    window.posthog.init(c.ph, {
      api_host: phHost,
      ui_host: 'https://us.posthog.com',
      persistence: 'memory',
      bootstrap: { distinctID: vid() },
      autocapture: true,
      capture_pageview: true,
      session_recording: { maskAllInputs: true, maskTextSelector: '[data-zt-private]' },
      loaded: function (ph) { ph.register({ product: c.slug }) }
    })
  }

  ready.then(function (c) { if (c && c.ph) loadPosthog(c) });

  // Autocapture skips anything inside [data-zt-private] (posthog-js honors the ph-no-capture class on any ancestor).
  // Window capture listeners run before PostHog's document listeners.
  ['click', 'change', 'submit'].forEach(function (type) {
    window.addEventListener(type, function (e) {
      var el = e.target && e.target.closest && e.target.closest('[data-zt-private]')
      if (el) el.classList.add('ph-no-capture')
    }, true)
  })

  // One call, both pipelines: hq (source of truth for money) and PostHog (behavior).
  function track(name, props) {
    send(name, props)
    return ready.then(function (c) {
      if (c && c.ph && window.posthog) window.posthog.capture(name, props || {}, { send_instantly: true, transport: 'sendBeacon' })
    })
  }

  function buyHref(a) {
    return buyUrl + '?plan=' + encodeURIComponent(a.getAttribute('data-zt-buy')) + '&vid=' + encodeURIComponent(vid())
  }

  function wireBuyLinks() {
    var links = document.querySelectorAll('a[data-zt-buy]')
    for (var i = 0; i < links.length; i++) links[i].href = buyHref(links[i])
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wireBuyLinks)
  else wireBuyLinks()

  // vid is appended at click time so the link always carries the current visitor id.
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-zt-buy]')
    if (!a) return
    a.href = buyHref(a)
    track('buy_click', { plan: a.getAttribute('data-zt-buy') })
  })

  window.zt = function (name, props) { return send(name, props) }
  window.zt.track = track
  window.zt('pageview')
})()
