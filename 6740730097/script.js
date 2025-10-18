(function(){
  // Default language: English unless user preference exists
  var lang = localStorage.getItem('site_lang') || 'en';

  var setLang = function(l){
    lang = l;
    localStorage.setItem('site_lang', l);

    // update all elements with data-ja/data-en
    document.querySelectorAll('[data-ja]').forEach(function(el){
      var ja = el.getAttribute('data-ja');
      var en = el.getAttribute('data-en') || ja;
      el.textContent = (l === 'en') ? en : ja;
    });

    // update buttons state
    document.querySelectorAll('.lang-switch button').forEach(function(btn){
      var btnLang = btn.getAttribute('data-lang') || (btn.id ? btn.id.replace(/^lang-/, '') : null);
      if(btnLang === l){
        btn.setAttribute('aria-checked','true');
      } else {
        btn.setAttribute('aria-checked','false');
      }
    });
  };

  // Attach handlers
  document.addEventListener('DOMContentLoaded', function(){
    // support old id-based buttons if present
    document.getElementById('lang-ja') && document.getElementById('lang-ja').addEventListener('click', function(){ setLang('ja'); });
    document.getElementById('lang-en') && document.getElementById('lang-en').addEventListener('click', function(){ setLang('en'); });

    // support data-lang buttons (hero and other places)
    document.querySelectorAll('button[data-lang]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var l = btn.getAttribute('data-lang');
        if(l) setLang(l);
      });
    });

    // allow URL parameter or hash to override language.
    // Support many forms: ?lang=jp, ?lang=ja, ?=jp, ?jp, #lang=jp, #jp etc.
    function normalizeLangCode(v){
      if(!v) return null;
      v = String(v).toLowerCase();
      if(v === 'jp') return 'ja';
      if(v === 'ja') return 'ja';
      if(v === 'en' || v === 'us' || v === 'en-us' || v === 'en_us') return 'en';
      return null;
    }

    var urlLang = (function(){
      try{
        var params = new URLSearchParams(window.location.search);
        // check explicit lang param
        if(params.has('lang')){
          var l = normalizeLangCode(params.get('lang'));
          if(l) return l;
        }
        // anonymous value like ?=jp -> key is ''
        if(params.has('')){
          var v = normalizeLangCode(params.get(''));
          if(v) return v;
        }
        // key-only like ?jp
        for(var pair of params.entries()){
          var k = pair[0], val = pair[1];
          if(k && !val){
            var n = normalizeLangCode(k);
            if(n) return n;
          }
        }
        // check hash
        if(window.location.hash){
          var hash = window.location.hash.replace(/^#/, '');
          var hp = new URLSearchParams(hash);
          if(hp.has('lang')){
            var hl = normalizeLangCode(hp.get('lang'));
            if(hl) return hl;
          }
          if(hp.has('')){
            var hv = normalizeLangCode(hp.get(''));
            if(hv) return hv;
          }
          // hash like #jp or #en
          if(!hash.includes('=')){
            var raw = normalizeLangCode(hash);
            if(raw) return raw;
          }
        }
      }catch(e){}
      return null;
    })();

    if(urlLang){
      setLang(urlLang);
    } else {
      setLang(lang);
    }

    // If host app wants to force language, it can call window.setSiteLang('ja'|'en') via WKWebView evaluateJavaScript
    window.setSiteLang = function(l){
      if(l === 'ja' || l === 'en') setLang(l);
    };
  });
})();