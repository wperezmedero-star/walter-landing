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
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var replayRequested = /(?:^|[?&])intro=1(?:&|$)/.test(location.search);
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
    // Articulated walk: independent hips, knees, ankles and opposing arms.
    // The source is one consistent rear-view Walter, so his face/clothes never morph.
    var walker = intro.querySelector('.storybook-walker');
    var rigImage = new Image(), rigReady = false, walkFrame = 0, playRequest = 0;
    var svgNS = 'http://www.w3.org/2000/svg';
    var rig = document.createElementNS(svgNS,'svg');
    rig.setAttribute('viewBox','0 0 1029 1529');
    rig.setAttribute('class','storybook-walk-rig');
    rig.setAttribute('aria-hidden','true');
    var defs = document.createElementNS(svgNS,'defs'); rig.appendChild(defs);
    var parts = {};
    function part(name,path){
      var clip = document.createElementNS(svgNS,'clipPath');
      clip.id = 'walter-rig-' + name;
      var shape = document.createElementNS(svgNS,'path'); shape.setAttribute('d',path);
      clip.appendChild(shape); defs.appendChild(clip);
      var group = document.createElementNS(svgNS,'g');
      var img = document.createElementNS(svgNS,'image');
      img.setAttribute('href','assets/walter-walk-puppet.webp');
      img.setAttribute('width','1029'); img.setAttribute('height','1529');
      img.setAttribute('clip-path','url(#' + clip.id + ')');
      group.appendChild(img); rig.appendChild(group); parts[name] = group;
    }
    part('leftArm','M360 535L412 591L394 715L350 775L280 875L280 975L190 1000L140 960L157 865L234 724L278 641Z');
    part('leftCalf','M316 1117L456 1117L430 1268L410 1375L290 1385L290 1260Z');
    part('leftShoe','M290 1335L413 1335L440 1295L512 1320L520 1529L240 1529L240 1390Z');
    part('leftThigh','M361 876L507 887L514 970L482 1080L449 1157L307 1157L326 1000Z');
    part('rightCalf','M551 1127L681 1127L707 1280L702 1384L576 1384L555 1250Z');
    part('rightShoe','M576 1340L698 1340L700 1295L782 1310L900 1420L900 1529L548 1529Z');
    part('rightThigh','M501 884L657 879L710 1042L686 1169L550 1169L522 1074Z');
    part('body','M0 0H1029V525L657 525L597 550L589 610L624 704L645 745L659 852L677 951L512 969L354 943L368 852L399 750L391 711L405 653L366 536L0 530Z');
    part('rightArm','M636 532L696 578L747 664L802 747L872 855L902 971L846 1010L784 984L765 895L693 808L638 725L598 667L586 605Z');
    walker.appendChild(rig);
    var rigLoaded = new Promise(function(resolve){
      rigImage.onload = function(){ rigReady = true; resolve(true); };
      rigImage.onerror = function(){ resolve(false); };
    });
    rigImage.src = 'assets/walter-walk-puppet.webp';
    function point(x,y){ return {x:x,y:y}; }
    function distance(a,b){ return Math.hypot(b.x-a.x,b.y-a.y); }
    function bone(name,a,b,c,d){
      var angle = Math.atan2(d.y-c.y,d.x-c.x)-Math.atan2(b.y-a.y,b.x-a.x);
      parts[name].setAttribute('transform','translate('+c.x+' '+c.y+') rotate('+(angle*180/Math.PI)+') translate('+(-a.x)+' '+(-a.y)+')');
    }
    var legs = [
      {name:'left',hip:point(432,926),knee:point(383,1138),ankle:point(350,1365),phase:0},
      {name:'right',hip:point(594,934),knee:point(617,1149),ankle:point(643,1366),phase:.5}
    ];
    function pose(seconds){
      legs.forEach(function(leg){
        var p = (seconds/1.18 + leg.phase) % 1;
        // 60% planted, 40% swing: both feet can support Walter, never both airborne.
        var swing = p >= .6, u = swing ? (p-.6)/.4 : p/.6;
        var stride = swing ? -1+2*(u*u*(3-2*u)) : 1-2*u;
        var lift = swing ? Math.sin(Math.PI*u)*48 : 0;
        var hip = leg.hip;
        var target = point(leg.ankle.x + stride*55,leg.ankle.y - 24 - stride*24 - lift);
        var a = distance(hip,leg.knee), b = distance(leg.knee,leg.ankle);
        var dx = target.x-hip.x, dy = target.y-hip.y;
        var raw = Math.hypot(dx,dy), reach = Math.min(raw,a+b-.1);
        target = point(hip.x+dx*reach/raw,hip.y+dy*reach/raw);
        var along = (a*a-b*b+reach*reach)/(2*reach);
        var bend = Math.sqrt(Math.max(0,a*a-along*along));
        var knee = point(hip.x+dx/raw*along+dy/raw*bend,hip.y+dy/raw*along-dx/raw*bend);
        bone(leg.name+'Thigh',hip,leg.knee,hip,knee);
        bone(leg.name+'Calf',leg.knee,leg.ankle,knee,target);
        var heel = swing ? -8*Math.sin(Math.PI*u) : 4*Math.sin(Math.PI*u);
        parts[leg.name+'Shoe'].setAttribute('transform','translate('+(target.x-leg.ankle.x)+' '+(target.y-leg.ankle.y)+') rotate('+heel+' '+leg.ankle.x+' '+leg.ankle.y+')');
      });
      var arm = Math.sin(seconds/1.18*Math.PI*2)*7;
      parts.leftArm.setAttribute('transform','rotate('+(-13+arm)+' 373 600)');
      parts.rightArm.setAttribute('transform','rotate('+(15-arm)+' 647 599)');
    }
    function stopWalk(){ cancelAnimationFrame(walkFrame); walkFrame = 0; playRequest++; }
    function startWalk(){
      var start = performance.now();
      function frame(now){
        if (!isPlaying || intro.hidden || intro.classList.contains('storybook-leaving')) return;
        pose(Math.max(0,(now-start-250)/1000));
        walkFrame = requestAnimationFrame(frame);
      }
      pose(0); walkFrame = requestAnimationFrame(frame);
    }
    var replay = document.createElement('button');
    replay.type = 'button'; replay.className = 'storybook-replay';
    var footer = document.querySelector('footer .wrap');
    if (footer) footer.appendChild(replay);
    var entranceLink = document.createElement('button');
    entranceLink.type = 'button'; entranceLink.className = 'btn btn-ghost';
    entranceLink.setAttribute('aria-haspopup','dialog');
    entranceLink.setAttribute('aria-controls',intro.id);
    var heroActions = document.querySelector('.hero .ctas');
    if (heroActions) heroActions.appendChild(entranceLink);
    function translate(){
      var en = document.documentElement.lang === 'en';
      intro.querySelector('.storybook-kicker').textContent = 'Walter Aprende Jugando';
      intro.querySelector('h2').textContent = en ? 'A little door. A world to discover.' : 'Una pequeña puerta. Un mundo por descubrir.';
      title.querySelector('p').textContent = en ? 'Music, stories and discoveries with Walter and Saltarina.' : 'Música, cuentos y descubrimientos con Walter y Saltarina.';
      enter.textContent = en ? 'Enter with Walter →' : 'Entrar con Walter →';
      skip.textContent = en ? 'Go straight to the website' : 'Ir directamente a la web';
      entranceLink.textContent = en ? 'See Walter’s entrance' : 'Ver la entrada de Walter';
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
      clearTimeout(timer); stopWalk();
      intro.classList.add('storybook-leaving');
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
      window.scrollTo({top:0,left:0,behavior:'instant'});
      enter.disabled = true;
      skip.focus({preventScroll:true});
      if (reduce) { endIntro(); return; }
      var request = ++playRequest;
      // Keep the greeting in place while artwork loads; Skip always stays usable.
      Promise.race([rigLoaded,new Promise(function(resolve){ setTimeout(function(){resolve(false);},5000); })]).then(function(ready){
        if (request !== playRequest || intro.hidden || !isPlaying) return;
        if (!ready) { endIntro(); return; }
        intro.classList.add('is-playing');
        startWalk();
        timer = setTimeout(endIntro,6400);
      });
    }
    function showIntro(){
      clearTimeout(timer); clearTimeout(fadeTimer); stopWalk();
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
    entranceLink.addEventListener('click',showIntro);
    document.addEventListener('keydown',function(e){
      if (intro.hidden) return;
      if (e.key === 'Escape') { e.preventDefault(); endIntro(); }
      if (e.key === 'Tab') {
        if (isPlaying) { e.preventDefault(); skip.focus(); }
        else if (e.shiftKey && document.activeElement === enter) { e.preventDefault(); skip.focus(); }
        else if (!e.shiftKey && document.activeElement === skip) { e.preventDefault(); enter.focus(); }
      }
    });
    // Home always opens with the cottage, including returning visitors.
    // Deep links still open their section; the hero button can replay the entrance.
    if (replayRequested || !location.hash || location.hash === '#inicio') showIntro();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',setupStorybook);
  else setupStorybook();
})();
