/* makethedangmovie — shared behavior. Data is stored in localStorage (demo mode)
   until a real backend is connected. All seed data below is fictional sample data. */
(function () {
  'use strict';

  var NAV = [
    ['index.html', 'Home'],
    ['actors-directors.html', 'Actors ↔ Directors'],
    ['producers-directors.html', 'Producers ↔ Directors'],
    ['marketplace.html', 'Gear Marketplace'],
    ['distribution.html', 'Distribution']
  ];

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  var store = {
    get: function (k, seed) {
      try { var v = localStorage.getItem('mtdm:' + k); return v ? JSON.parse(v) : seed; } catch (e) { return seed; }
    },
    set: function (k, v) {
      try { localStorage.setItem('mtdm:' + k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ }
    }
  };
  function toast(msg) {
    var t = document.createElement('div');
    t.className = 'toast'; t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 2800);
  }

  /* ---------- header / footer ---------- */
  function chrome() {
    var here = location.pathname.split('/').pop() || 'index.html';
    var links = NAV.map(function (n) {
      return '<a href="' + n[0] + '"' + (n[0] === here ? ' class="active"' : '') + '>' + n[1] + '</a>';
    }).join('');
    var h = document.createElement('header');
    h.className = 'site';
    h.innerHTML = '<div class="wrap"><a class="logo" href="index.html">make<span>the</span>dangmovie</a><nav>' + links + '</nav></div>';
    document.body.prepend(h);
    var f = document.createElement('footer');
    f.className = 'site';
    f.innerHTML = '<div class="wrap">© ' + new Date().getFullYear() + ' makethedangmovie · Distribution partner: <a href="https://janice.click" target="_blank" rel="noopener">janice.click</a></div>';
    document.body.appendChild(f);
  }

  /* ---------- connect dialog ---------- */
  var dlg;
  function connectDialog() {
    dlg = document.createElement('dialog');
    dlg.innerHTML =
      '<form method="dialog" id="connect-form">' +
      '<h3 id="connect-title">Connect</h3>' +
      '<label>Your name<input name="from" required></label><br>' +
      '<label>Your email<input name="email" type="email" required></label><br>' +
      '<label>Message<textarea name="msg" rows="4" required placeholder="Introduce yourself and your project…"></textarea></label>' +
      '<div class="row"><button type="button" class="btn ghost small" id="connect-cancel">Cancel</button>' +
      '<button class="btn small" value="send">Send</button></div></form>';
    document.body.appendChild(dlg);
    var target = '';
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-connect]');
      if (!b) return;
      target = b.getAttribute('data-connect');
      dlg.querySelector('#connect-title').textContent = 'Message ' + target;
      dlg.showModal();
    });
    dlg.querySelector('#connect-cancel').addEventListener('click', function () { dlg.close(); });
    dlg.querySelector('form').addEventListener('submit', function (e) {
      var fd = new FormData(e.target);
      var box = store.get('outbox', []);
      box.push({ to: target, from: fd.get('from'), email: fd.get('email'), msg: fd.get('msg'), at: new Date().toISOString() });
      store.set('outbox', box);
      e.target.reset();
      toast('Message queued for ' + target);
    });
  }

  /* ---------- generic board ---------- */
  function board(cfg) {
    var list = document.getElementById('list');
    var count = document.getElementById('count');
    var q = document.getElementById('q');
    var items = store.get(cfg.key, cfg.seed);
    var tab = cfg.tabs ? cfg.tabs[0].value : null;

    function render() {
      var term = q ? q.value.trim().toLowerCase() : '';
      var shown = items.filter(function (it) {
        if (cfg.tabField && tab && it[cfg.tabField] !== tab) return false;
        var ok = true;
        document.querySelectorAll('[data-filter]').forEach(function (sel) {
          var f = sel.getAttribute('data-filter');
          if (sel.value && String(it[f]) !== sel.value) ok = false;
        });
        if (!ok) return false;
        if (term && Object.keys(it).map(function (k) { return it[k]; }).join(' ').toLowerCase().indexOf(term) < 0) return false;
        return true;
      });
      count.textContent = shown.length + (shown.length === 1 ? ' result' : ' results');
      list.innerHTML = shown.length ? shown.map(cfg.card).join('') : '<div class="empty">Nothing matches yet. Try clearing filters or post your own listing below.</div>';
    }

    document.querySelectorAll('[data-filter]').forEach(function (s) { s.addEventListener('change', render); });
    if (q) q.addEventListener('input', render);
    var tabs = document.querySelectorAll('.tab');
    tabs.forEach(function (b) {
      b.addEventListener('click', function () {
        tab = b.getAttribute('data-tab');
        tabs.forEach(function (x) { x.classList.toggle('on', x === b); });
        render();
      });
    });

    var form = document.getElementById('post-form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var fd = new FormData(form), obj = { id: Date.now() };
        fd.forEach(function (v, k) { obj[k] = String(v).trim(); });
        items.unshift(obj);
        store.set(cfg.key, items);
        form.reset();
        render();
        toast('Posted! Scroll up to see it.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
    render();
  }

  /* ---------- page configs ---------- */
  var pages = {};

  pages.actors = function () {
    board({
      key: 'people',
      tabField: 'kind',
      tabs: [{ value: 'actor' }, { value: 'director' }],
      seed: [
        { id: 1, kind: 'actor', name: 'Maya Delgado', location: 'Austin, TX', genre: 'Drama', bio: 'Stage-trained actor, 8 years of indie shorts. Comfortable with improv and heavy emotional scenes.', looking: 'Lead or supporting roles in feature dramas' },
        { id: 2, kind: 'actor', name: 'Terrence Boyd', location: 'Atlanta, GA', genre: 'Action', bio: 'Stunt-certified actor with martial arts and driving experience.', looking: 'Action leads, stunt-heavy supporting parts' },
        { id: 3, kind: 'actor', name: 'Priya Nair', location: 'Chicago, IL', genre: 'Comedy', bio: 'Sketch and improv performer (Second City alum). Quick on her feet, great with ensemble casts.', looking: 'Comedy features and web series' },
        { id: 4, kind: 'actor', name: 'Sam Whitlock', location: 'Portland, OR', genre: 'Horror', bio: 'Genre fan with practical-FX experience. Loves a good creature feature.', looking: 'Horror shorts and features' },
        { id: 5, kind: 'director', name: 'Ines Okafor', location: 'Los Angeles, CA', genre: 'Drama', bio: 'Festival-circuit director of three shorts. Prepping a feature about a family-run restaurant.', looking: 'Two leads (30s–50s), one teen supporting role' },
        { id: 6, kind: 'director', name: 'Jake Moretti', location: 'New York, NY', genre: 'Comedy', bio: 'Writer-director, mockumentary style. Shoots fast on a tight budget.', looking: 'Ensemble comedic cast, improvisers welcome' },
        { id: 7, kind: 'director', name: 'Dana Whitfield', location: 'Atlanta, GA', genre: 'Action', bio: 'Former stunt coordinator turned director. Practical effects over CGI.', looking: 'Physical performers for a 12-day shoot' }
      ],
      card: function (p) {
        return '<article class="card"><div><span class="badge">' + esc(p.kind) + '</span><span class="badge alt">' + esc(p.genre) + '</span></div>' +
          '<h3>' + esc(p.name) + '</h3><div class="meta">📍 ' + esc(p.location) + '</div>' +
          '<p>' + esc(p.bio) + '</p><p><strong>' + (p.kind === 'actor' ? 'Seeking:' : 'Casting:') + '</strong> ' + esc(p.looking) + '</p>' +
          '<div class="foot"><span></span><button class="btn small" data-connect="' + esc(p.name) + '">Connect</button></div></article>';
      }
    });
  };

  pages.producers = function () {
    board({
      key: 'pd',
      tabField: 'kind',
      tabs: [{ value: 'producer' }, { value: 'director' }],
      seed: [
        { id: 1, kind: 'producer', name: 'Harlan Reese', location: 'Los Angeles, CA', genre: 'Thriller', budget: '$500K–$2M', bio: 'Produced 6 features, 2 streaming deals. Looking for tight, contained thrillers.', looking: 'Finished scripts with an attached director' },
        { id: 2, kind: 'producer', name: 'Lucía Armendáriz', location: 'Miami, FL', genre: 'Drama', budget: 'Under $500K', bio: 'Micro-budget specialist. Known for getting festival-ready films done in 18 days.', looking: 'Character-driven dramas, first-time directors OK' },
        { id: 3, kind: 'producer', name: 'Gil Abernathy', location: 'Nashville, TN', genre: 'Comedy', budget: '$500K–$2M', bio: 'Executive producer with distribution relationships and a small private investor group.', looking: 'Comedies with strong marketable hooks' },
        { id: 4, kind: 'director', name: 'Noor Hassan', location: 'Toronto, ON', genre: 'Thriller', budget: '$500K–$2M', bio: 'Two award-winning shorts; feature script locked and storyboarded.', looking: 'Producer to package financing and sales' },
        { id: 5, kind: 'director', name: 'Cody Brandt', location: 'Denver, CO', genre: 'Horror', budget: 'Under $500K', bio: 'Self-financed two horror shorts that hit 1M+ views. Ready for a feature.', looking: 'Producer experienced with genre festivals' },
        { id: 6, kind: 'director', name: 'Rosa Mendel', location: 'Austin, TX', genre: 'Drama', budget: 'Under $500K', bio: 'Documentary-trained narrative director with a completed pitch deck and lookbook.', looking: 'Line producer + financing partner' }
      ],
      card: function (p) {
        return '<article class="card"><div><span class="badge">' + esc(p.kind) + '</span><span class="badge alt">' + esc(p.genre) + '</span></div>' +
          '<h3>' + esc(p.name) + '</h3><div class="meta">📍 ' + esc(p.location) + ' · 💰 ' + esc(p.budget) + '</div>' +
          '<p>' + esc(p.bio) + '</p><p><strong>' + (p.kind === 'producer' ? 'Wants:' : 'Needs:') + '</strong> ' + esc(p.looking) + '</p>' +
          '<div class="foot"><span></span><button class="btn small" data-connect="' + esc(p.name) + '">Connect</button></div></article>';
      }
    });
  };

  pages.market = function () {
    board({
      key: 'gear',
      seed: [
        { id: 1, title: 'Sony FX3 Cinema Camera', category: 'Cameras', mode: 'Rent', price: '$140/day', location: 'Los Angeles, CA', description: 'Body, 2 batteries, cage, 512GB CFexpress card.' },
        { id: 2, title: 'Aputure 600d Pro Light Kit', category: 'Lighting', mode: 'Rent', price: '$95/day', location: 'Atlanta, GA', description: 'Light, stand, softbox, and ballast. Great for sets.' },
        { id: 3, title: 'Rode NTG5 Shotgun Mic', category: 'Audio', mode: 'Sale', price: '$380', location: 'Austin, TX', description: 'Lightly used with blimp and boom pole.' },
        { id: 4, title: 'Zeiss CP.3 Prime Set (5 lens)', category: 'Lenses', mode: 'Rent', price: '$250/day', location: 'New York, NY', description: 'EF mount, T2.1, with hard case.' },
        { id: 5, title: 'DJI RS 3 Pro Gimbal', category: 'Grip', mode: 'Sale', price: '$650', location: 'Chicago, IL', description: 'Like new, includes extended grip and case.' },
        { id: 6, title: 'Dolly + 12ft Track Kit', category: 'Grip', mode: 'Rent', price: '$70/day', location: 'Portland, OR', description: 'Smooth, quiet, easy to carry in a van.' }
      ],
      card: function (g) {
        return '<article class="card"><div><span class="badge">' + esc(g.category) + '</span><span class="badge alt">' + esc(g.mode) + '</span></div>' +
          '<h3>' + esc(g.title) + '</h3><div class="meta">📍 ' + esc(g.location) + '</div>' +
          '<p>' + esc(g.description) + '</p>' +
          '<div class="foot"><span class="price">' + esc(g.price) + '</span><button class="btn small" data-connect="' + esc(g.title) + ' seller">Contact</button></div></article>';
      }
    });
  };

  pages.distribution = function () {
    var form = document.getElementById('dist-form');
    var list = document.getElementById('submissions');
    var subs = store.get('dist', []);
    function render() {
      list.innerHTML = subs.length ? subs.map(function (s) {
        return '<div class="card"><h3>' + esc(s.title) + '</h3><div class="meta">' + esc(s.genre) + ' · ' + esc(s.runtime) + ' min · ' + esc(s.status) + '</div></div>';
      }).join('') : '<div class="empty">No submissions saved on this device yet.</div>';
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fd = new FormData(form), o = {};
      fd.forEach(function (v, k) { o[k] = String(v).trim(); });
      o.id = Date.now();
      subs.unshift(o);
      store.set('dist', subs);
      form.reset();
      render();
      toast('Saved. Next: continue at janice.click');
    });
    render();
  };

  /* ---------- boot ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    chrome();
    connectDialog();
    var p = document.body.getAttribute('data-page');
    if (p && pages[p]) pages[p]();
  });
})();
