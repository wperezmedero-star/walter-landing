(function(){
  var root = document.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var base = document.body.getAttribute('data-base') || '';

  // ---- ES / EN toggle (only on pages that have it)
  var bes = document.getElementById('b-es'), ben = document.getElementById('b-en');
  if (bes && ben) {
    var els = [].slice.call(document.querySelectorAll('[data-en]'));
    els.forEach(function(e){ e.dataset.es = e.innerHTML; });
    var set = function(l){
      els.forEach(function(e){ e.innerHTML = l === 'en' ? e.dataset.en : e.dataset.es; });
      root.lang = l; bes.classList.toggle('on', l === 'es'); ben.classList.toggle('on', l === 'en');
      try { localStorage.setItem('walter-lang', l); } catch(e) {}
      document.dispatchEvent(new Event('walter:languagechange'));
    };
    bes.onclick = function(){ set('es'); }; ben.onclick = function(){ set('en'); };
    var l = 'es'; try { l = localStorage.getItem('walter-lang') || 'es'; } catch(e) {}
    if (l === 'en') set('en');
  }

  // ---- Accessible navigation for small screens
  var menuToggle = document.querySelector('.nav-toggle'), menuNav = document.querySelector('.nav');
  if (menuToggle && menuNav) {
    var menuText = menuToggle.querySelector('.nav-toggle-text');
    var menuIcon = menuToggle.querySelector('.nav-toggle-icon');
    var paintMenu = function(open){
      var en = root.lang === 'en';
      menuToggle.setAttribute('aria-expanded', String(open));
      menuToggle.setAttribute('aria-label', open ? (en ? 'Close menu' : 'Cerrar menú') : (en ? 'Open menu' : 'Abrir menú'));
      if (menuText) menuText.textContent = open ? (en ? 'Close' : 'Cerrar') : (en ? 'Menu' : 'Menú');
      if (menuIcon) menuIcon.textContent = open ? '×' : '☰';
    };
    var setMenu = function(open){ menuNav.classList.toggle('open', open); paintMenu(open); };
    paintMenu(false);
    menuToggle.addEventListener('click', function(){ setMenu(!menuNav.classList.contains('open')); });
    [].forEach.call(menuNav.querySelectorAll('ul a'), function(a){ a.addEventListener('click', function(){ setMenu(false); }); });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape') setMenu(false); });
    document.addEventListener('click', function(e){ if (!menuNav.contains(e.target)) setMenu(false); });
    window.addEventListener('resize', function(){ if (window.innerWidth > 900) setMenu(false); });
    document.addEventListener('walter:languagechange', function(){ paintMenu(menuNav.classList.contains('open')); });
  }

  // ---- Saltarina perches on each section heading
  [].forEach.call(document.querySelectorAll('.sec-head'), function(h){
    var p = document.createElement('span'); p.className = 'perch'; p.setAttribute('aria-hidden','true');
    p.innerHTML = '<img src="' + base + 'assets/saltarina.webp" alt="">';
    h.insertBefore(p, h.firstChild);
  });

  // ---- reveal + ink-to-color
  var targets = document.querySelectorAll('.rv, .ink, .sec-head');
  if (!('IntersectionObserver' in window) || reduce) {
    [].forEach.call(targets, function(t){ t.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){ if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });
    [].forEach.call(targets, function(t){ io.observe(t); });
  }

  // ---- golden sparks rising from the book
  var stage = document.querySelector('.stage');
  if (stage && !reduce) {
    for (var i = 0; i < 9; i++) {
      var s = document.createElement('span'); s.className = 'spark';
      s.style.left = (32 + Math.random() * 46) + '%';
      s.style.animationDelay = (1.2 + i * 0.45) + 's';
      s.style.animationDuration = (3 + Math.random() * 1.8) + 's';
      stage.appendChild(s);
    }
  }

  // ---- Herbario: the book turns its pages
  var herb = document.querySelector('.herb');
  if (herb) {
    var pages = JSON.parse(herb.getAttribute('data-pages'));
    var img = herb.querySelector('.page img'), page = herb.querySelector('.page');
    var cap = herb.querySelector('.cap'), song = herb.querySelector('.song');
    var i = 0, timer = null, visible = false;
    var show = function(n){
      i = (n + pages.length) % pages.length;
      var go = function(){ img.src = base + 'assets/' + pages[i].img; img.alt = pages[i].cap; cap.textContent = pages[i].cap; song.textContent = pages[i].song; };
      if (reduce) { go(); return; }
      page.classList.remove('turn'); void page.offsetWidth; page.classList.add('turn');
      setTimeout(go, 430);
    };
    herb.querySelector('.prev').onclick = function(){ show(i - 1); restart(); };
    herb.querySelector('.next').onclick = function(){ show(i + 1); restart(); };
    var restart = function(){ clearInterval(timer); if (visible && !reduce) timer = setInterval(function(){ show(i + 1); }, 4200); };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function(es){ visible = es[0].isIntersecting; restart(); }, { threshold: 0.4 }).observe(herb);
    }
  }
})();

// Illustrated entrance. Artwork and characters remain separate for depth.
(function(){
  function setupStorybook(){
    if (!document.querySelector('.hero .stage')) return;
    var storageKey = 'walter-storybook-intro-v2';
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var replayRequested = /(?:^|[?&])intro=1(?:&|$)/.test(location.search);
    var seen = false;
    try { seen = localStorage.getItem(storageKey) === 'seen'; } catch(e) {}
    var intro = document.createElement('div');
    intro.id = 'walter-storybook-intro';
    intro.className = 'storybook-intro';
    intro.hidden = true;
    intro.setAttribute('role','dialog');
    intro.setAttribute('aria-modal','true');
    intro.setAttribute('aria-labelledby','storybook-heading');
    intro.innerHTML =
      '<div class="storybook-ambience" aria-hidden="true"></div>' +
      '<div class="storybook-scene" aria-hidden="true"><div class="storybook-canvas">' +
        '<img class="storybook-landscape" src="assets/casita-cuento-v2.webp" alt="" width="1536" height="1024" decoding="async">' +
        '<div class="storybook-doorway"><div class="storybook-door"></div></div>' +
        '<div class="storybook-walker"><span class="storybook-footshadow"></span><img class="storybook-walter" src="assets/walter.webp" alt="" width="560" height="835"></div>' +
        '<div class="storybook-flight"><img class="storybook-saltarina" src="assets/saltarina.webp" alt="" width="200" height="136"></div>' +
      '</div></div>' +
      '<div class="storybook-title"><span class="storybook-kicker"></span><h2 id="storybook-heading"></h2><p></p></div>' +
      '<div class="storybook-controls"><button class="storybook-enter" type="button"></button><button class="storybook-skip" type="button"></button></div>';
    document.body.insertBefore(intro,document.body.firstChild);
    var enter = intro.querySelector('.storybook-enter');
    var skip = intro.querySelector('.storybook-skip');
    var title = intro.querySelector('.storybook-title');
    var landscape = intro.querySelector('.storybook-landscape');
    var lastFocus, timer, fadeTimer, isPlaying = false, suspended = [];
    var replay = document.createElement('button');
    replay.type = 'button'; replay.className = 'storybook-replay';
    var footer = document.querySelector('footer .wrap');
    if (footer) footer.appendChild(replay);
    function translate(){
      var en = document.documentElement.lang === 'en';
      intro.querySelector('.storybook-kicker').textContent = 'Walter Aprende Jugando';
      intro.querySelector('h2').textContent = en ? 'A little door. A world to discover.' : 'Una pequeña puerta. Un mundo por descubrir.';
      title.querySelector('p').textContent = en ? 'Music, stories and discoveries with Walter and Saltarina.' : 'Música, cuentos y descubrimientos con Walter y Saltarina.';
      enter.textContent = en ? 'Enter with Walter →' : 'Entrar con Walter →';
      skip.textContent = en ? 'Go straight to the website' : 'Ir directamente a la web';
      replay.textContent = en ? 'Visit Walter’s cottage again' : 'Volver a entrar a la casita de Walter';
    }
    translate();
    document.addEventListener('walter:languagechange',translate);
    function restorePage(){
      suspended.forEach(function(el){ el.inert = false; });
      suspended = [];
      document.body.classList.remove('storybook-lock');
    }
    function endIntro(){
      if (intro.hidden || intro.classList.contains('storybook-leaving')) return;
      clearTimeout(timer);
      intro.classList.add('storybook-leaving');
      try { localStorage.setItem(storageKey,'seen'); } catch(e) {}
      fadeTimer = setTimeout(function(){
        intro.hidden = true;
        intro.classList.remove('is-playing','storybook-leaving');
        var focus = isPlaying ? document.querySelector('.hero h1') : (lastFocus && lastFocus !== document.body ? lastFocus : document.querySelector('.hero h1'));
        isPlaying = false; restorePage();
        if (focus && document.contains(focus)) {
          if (!focus.hasAttribute('tabindex') && focus.tagName === 'H1') focus.setAttribute('tabindex','-1');
          focus.focus({preventScroll:true});
        }
      },reduce ? 0 : 450);
    }
    function play(){
      if (isPlaying || intro.hidden) return;
      isPlaying = true;
      // Crossing the door reveals the beginning of the real website.
      window.scrollTo({top:0,left:0,behavior:'instant'});
      if (reduce) { endIntro(); return; }
      intro.classList.add('is-playing');
      enter.disabled = true;
      skip.focus({preventScroll:true});
      timer = setTimeout(endIntro,5600);
    }
    function showIntro(){
      clearTimeout(timer); clearTimeout(fadeTimer);
      lastFocus = document.activeElement;
      intro.classList.remove('is-playing','storybook-leaving');
      intro.hidden = false; isPlaying = false; enter.disabled = false;
      translate();
      [].forEach.call(document.body.children,function(el){
        if (el !== intro && el.tagName !== 'SCRIPT' && !el.inert) { el.inert = true; suspended.push(el); }
      });
      document.body.classList.add('storybook-lock');
      enter.focus({preventScroll:true});
    }
    landscape.addEventListener('error',function(){ intro.classList.add('storybook-art-unavailable'); });
    enter.addEventListener('click',play);
    skip.addEventListener('click',endIntro);
    replay.addEventListener('click',showIntro);
    document.addEventListener('keydown',function(e){
      if (intro.hidden) return;
      if (e.key === 'Escape') { e.preventDefault(); endIntro(); }
      if (e.key === 'Tab') {
        if (isPlaying) { e.preventDefault(); skip.focus(); }
        else if (e.shiftKey && document.activeElement === enter) { e.preventDefault(); skip.focus(); }
        else if (!e.shiftKey && document.activeElement === skip) { e.preventDefault(); enter.focus(); }
      }
    });
    // Never replay unexpectedly for visitors arriving at a specific section.
    if (replayRequested || (!seen && !location.hash)) showIntro();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',setupStorybook);
  else setupStorybook();
})();
