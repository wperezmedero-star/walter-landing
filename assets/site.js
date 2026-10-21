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
    };
    bes.onclick = function(){ set('es'); }; ben.onclick = function(){ set('en'); };
    var l = 'es'; try { l = localStorage.getItem('walter-lang') || 'es'; } catch(e) {}
    if (l === 'en') set('en');
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
