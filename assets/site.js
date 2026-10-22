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



// ===== La casita de Walter: introducción animada, accesible y opcional =====
(function(){
  function setupStorybook(){
    if (!document.querySelector('.hero .stage') || document.getElementById('walter-storybook-intro')) return;
    var storageKey = 'walter-storybook-intro-v1';
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var replayRequested = /(?:^|[?&])intro=1(?:&|$)/.test(window.location.search);
    var hasVisited = false;
    try { hasVisited = localStorage.getItem(storageKey) === 'seen'; } catch (e) {}
    var intro = document.createElement('div');
    intro.id = 'walter-storybook-intro';
    intro.className = 'storybook-intro';
    intro.setAttribute('role','dialog');
    intro.setAttribute('aria-modal','true');
    intro.setAttribute('aria-label','Bienvenida al mundo de Walter');
    intro.hidden = true;
    intro.innerHTML =
      '<div class="storybook-scene" aria-hidden="true">' +
        '<div class="storybook-sun"></div><div class="storybook-cloud c1"></div><div class="storybook-cloud c2"></div>' +
        '<div class="storybook-hill"></div><div class="storybook-path"></div>' +
        '<div class="storybook-house">' +
          '<div class="storybook-chimney"></div><div class="storybook-wall">' +
            '<div class="storybook-window left"></div><div class="storybook-window right"></div>' +
            '<div class="storybook-planter left"></div><div class="storybook-planter right"></div>' +
            '<div class="storybook-doorway"><div class="storybook-portal"><img src="assets/logo.webp" alt=""></div><div class="storybook-door"></div></div>' +
          '</div><div class="storybook-roof"></div>' +
        '</div>' +
        '<span class="storybook-flower f1">✿</span><span class="storybook-flower f2">✿</span><span class="storybook-flower f3">✿</span><span class="storybook-flower f4">✿</span>' +
        '<img class="storybook-walter" src="assets/walter.webp" alt="">' +
        '<img class="storybook-saltarina" src="assets/saltarina.webp" alt="">' +
      '</div>' +
      '<div class="storybook-title"><strong>¡Bienvenidos al mundo de Walter!</strong><span>Una puerta a la imaginación, la música y el aprendizaje</span></div>' +
      '<div class="storybook-controls"><button class="storybook-skip" type="button">Saltar intro →</button></div>';
    document.body.insertBefore(intro,document.body.firstChild);
    var skip = intro.querySelector('.storybook-skip');
    var timer = null, fadeTimer = null, lastFocus = null;
    var footer = document.querySelector('footer .wrap');
    if (footer) {
      var replay = document.createElement('button');
      replay.type = 'button';
      replay.className = 'storybook-replay';
      replay.textContent = '🏡 Volver a entrar a la casita';
      replay.addEventListener('click',function(){ showIntro(); });
      footer.appendChild(replay);
    }
    function endIntro(){
      if (intro.hidden || intro.classList.contains('storybook-leaving')) return;
      clearTimeout(timer);
      intro.classList.add('storybook-leaving');
      try { localStorage.setItem(storageKey,'seen'); } catch (e) {}
      fadeTimer = window.setTimeout(function(){
        intro.hidden = true;
        intro.classList.remove('is-playing','storybook-leaving');
        document.body.classList.remove('storybook-lock');
        if (lastFocus && document.contains(lastFocus) && typeof lastFocus.focus === 'function') {
          lastFocus.focus({preventScroll:true});
        } else {
          var target = document.querySelector('.hero h1');
          if (target) { target.setAttribute('tabindex','-1'); target.focus({preventScroll:true}); }
        }
      },reduce ? 20 : 850);
    }
    function showIntro(){
      clearTimeout(timer);clearTimeout(fadeTimer);
      lastFocus = document.activeElement;
      intro.classList.remove('is-playing','storybook-leaving');
      intro.hidden = false;
      document.body.classList.add('storybook-lock');
      void intro.offsetWidth; // reset animations for replay
      skip.focus({preventScroll:true});
      if (reduce) {
        timer = window.setTimeout(endIntro,1900);
      } else {
        requestAnimationFrame(function(){ intro.classList.add('is-playing'); });
        timer = window.setTimeout(endIntro,6400);
      }
    }
    skip.addEventListener('click',endIntro);
    document.addEventListener('keydown',function(e){
      if (!intro.hidden && e.key === 'Escape') endIntro();
      if (!intro.hidden && e.key === 'Tab') {
        e.preventDefault();
        skip.focus();
      }
    });
    if (!hasVisited || replayRequested) showIntro();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',setupStorybook);
  else setupStorybook();
})();
