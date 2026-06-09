// ============================================================
// SOLO LEVELING LOADING SCREEN
// ============================================================
(function() {
    document.documentElement.style.overflow = 'hidden';
    document.body.classList.add('sl-loading');

    const screen   = document.getElementById('sl-loading-screen');
    const bar      = document.getElementById('slLoadBar');
    const pct      = document.getElementById('slLoadPct');
    const status   = document.getElementById('slLoadStatus');
    const flash    = document.getElementById('slLoadFlash');
    const canvas   = document.getElementById('sl-load-canvas');

    const statusMsgs = [
        { at: 0,   text: 'Awakening...' },
        { at: 15,  text: 'Detecting mana signature...' },
        { at: 30,  text: 'Dungeon gates unlocking...' },
        { at: 45,  text: 'Shadow soldiers emerging...' },
        { at: 60,  text: 'System registering hunter...' },
        { at: 75,  text: 'Arise — loading skills...' },
        { at: 88,  text: 'Shadow Monarch awakened.' },
        { at: 97,  text: 'Entering the dungeon...' },
    ];

    const ctx = canvas ? canvas.getContext('2d') : null;
    let W, H, particles = [];

    function resizeCanvas() {
        if (!canvas) return;
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function spawnParticle() {
        return {
            x: Math.random() * W, y: Math.random() * H,
            vx: (Math.random() - 0.5) * 0.4,
            vy: -(Math.random() * 0.6 + 0.2),
            life: 0,
            maxLife: 80 + Math.random() * 120,
            size: Math.random() * 2.5 + 0.5,
            hue: Math.random() > 0.4 ? 270 : 200,
        };
    }
    for (let i = 0; i < 90; i++) particles.push(spawnParticle());

    function drawParticles() {
        if (!ctx) return;
        ctx.clearRect(0, 0, W, H);
        particles.forEach((p, i) => {
            p.x += p.vx; p.y += p.vy; p.life++;
            if (p.life > p.maxLife) particles[i] = spawnParticle();
            const alpha = Math.sin((p.life / p.maxLife) * Math.PI) * 0.7;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = 'hsla(' + p.hue + ', 90%, 75%, ' + alpha + ')';
            ctx.fill();
        });
    }

    let rafId;
    function animLoop() { drawParticles(); rafId = requestAnimationFrame(animLoop); }
    animLoop();

    let progress = 0, lastMsgIdx = -1;

    function tick() {
        const remaining = 100 - progress;
        const step = Math.max(0.3, remaining * 0.025) * (Math.random() * 1.5 + 0.5);
        progress = Math.min(100, progress + step);
        bar.style.width = progress + '%';
        pct.textContent = Math.floor(progress) + '%';

        for (let i = statusMsgs.length - 1; i >= 0; i--) {
            if (progress >= statusMsgs[i].at && i > lastMsgIdx) {
                lastMsgIdx = i;
                status.style.animation = 'none';
                void status.offsetHeight;
                status.style.animation = 'sl-status-flicker 0.4s ease-in-out';
                status.textContent = statusMsgs[i].text;
                break;
            }
        }

        if (progress < 100) {
            setTimeout(tick, 60 + Math.random() * 80);
        } else {
            setTimeout(finishLoading, 400);
        }
    }

    function finishLoading() {
        flash.classList.add('active');
        setTimeout(function() {
            flash.classList.remove('active');
            screen.classList.add('sl-load-hidden');
            document.body.classList.remove('sl-loading');
            document.body.classList.add('sl-ready');
            document.documentElement.style.overflow = '';
            cancelAnimationFrame(rafId);
            setTimeout(function() { if (screen) screen.remove(); }, 1000);
        }, 200);
    }

    setTimeout(tick, 600);
})();

// ============================================================
// SCROLL HEADER EFFECT
// ============================================================
function attachScrollListener(pageEl) {
  pageEl.addEventListener('scroll', function () {
    const header = document.getElementById('header');
    if (pageEl.scrollTop > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

// ============================================================
// PAGE SWITCHING
// ============================================================
let currentPage = '1';

function goToPage(pageNum) {
  pageNum = String(pageNum);
  if (pageNum === currentPage) return;

  const from = document.getElementById('page-' + currentPage);
  const to   = document.getElementById('page-' + pageNum);
  const goingForward = parseInt(pageNum) > parseInt(currentPage);

  document.getElementById('header').classList.remove('scrolled');

  from.classList.remove('active');
  from.classList.add(goingForward ? 'exit-left' : 'exit-right');

  to.style.transform = goingForward ? 'translateX(60px)' : 'translateX(-60px)';
  to.style.opacity = '0';
  to.scrollTop = 0;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      to.classList.add('active');
      to.style.transform = '';
      to.style.opacity = '';
    });
  });

  setTimeout(() => {
    from.classList.remove('exit-left', 'exit-right');
  }, 420);

  document.querySelectorAll('nav .nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.page === pageNum);
  });

  currentPage = pageNum;

  // Trigger skill bar animation when going to page 2
  if (pageNum === '2') {
    setTimeout(() => {
      document.querySelectorAll('.skill-bar').forEach(bar => {
        const w = getComputedStyle(bar).getPropertyValue('--w').trim();
        if (w) bar.style.width = w;
      });
    }, 150);
  }
}

// ============================================================
// INIT ON DOM READY
// ============================================================
document.addEventListener('DOMContentLoaded', function () {

  // Nav click
  document.querySelectorAll('nav .nav-link').forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      goToPage(this.dataset.page);
    });
  });

  // Logo click → page 1
  document.querySelector('.logo').addEventListener('click', function (e) {
    e.preventDefault();
    goToPage('1');
  });

  // Attach scroll listeners to all pages
  document.querySelectorAll('.page').forEach(attachScrollListener);

  // Init all music cards — baca data-src dan siapkan Audio
  initMusicCards();

  // Init gallery cover images
  initGalleryCovers();

  // ============================================================
  // SOLO LEVELING PARTICLES — page-4
  // ============================================================
  (function spawnParticles() {
    const container = document.getElementById('slParticles');
    if (!container) return;
    function createParticle() {
      const p = document.createElement('div');
      p.className = 'sl-particle';
      const size = Math.random() * 4 + 2;
      const left = Math.random() * 100;
      const dur  = Math.random() * 8 + 5;
      const del  = Math.random() * 4;
      p.style.cssText = `width:${size}px;height:${size}px;left:${left}%;bottom:-10px;animation-duration:${dur}s;animation-delay:-${del}s;`;
      const hue = Math.random() > 0.5 ? '270' : '230';
      p.style.background = `hsla(${hue},100%,70%,0.8)`;
      p.style.boxShadow  = `0 0 6px hsla(${hue},100%,70%,1)`;
      container.appendChild(p);
      setTimeout(() => p.remove(), (dur + del) * 1000);
    }
    for (let i = 0; i < 30; i++) setTimeout(createParticle, i * 150);
    setInterval(createParticle, 280);
  })();

  // ============================================================
  // TYPING ANIMATION
  // ============================================================
  const words  = ['Web Developer', 'Web Designer', 'Youtuber', 'Gamer', 'Mahasiswa PNUP'];
  const spanEl = document.querySelector('.typing-text span');
  if (spanEl) {
    // Buat elemen khusus untuk teks yang diketik
    spanEl.innerHTML = '';
    const typed = document.createElement('span');
    typed.className = 'typed-word';
    spanEl.appendChild(typed);

    let wordIdx  = 0;
    let charIdx  = 0;
    let deleting = false;

    function typeLoop() {
      const word    = words[wordIdx];
      const current = word.substring(0, charIdx);
      typed.textContent = current;

      let delay = deleting ? 60 : 110;

      if (!deleting && charIdx === word.length) {
        delay = 1800; // pause sebelum hapus
        deleting = true;
      } else if (deleting && charIdx === 0) {
        deleting = false;
        wordIdx  = (wordIdx + 1) % words.length;
        delay = 400;
      }

      charIdx += deleting ? -1 : 1;
      setTimeout(typeLoop, delay);
    }

    typeLoop();
  }
});

// ============================================================
// GALLERY — baca src dari <img> langsung, handle jika gagal load
// ============================================================
function initGalleryCovers() {
  document.querySelectorAll('.gallery-thumb').forEach(thumb => {
    const img = thumb.querySelector('.thumb-img');
    if (!img) return;
    if (!img.src || img.src === window.location.href) {
      thumb.classList.add('no-img');
      return;
    }
    img.addEventListener('error', function () {
      thumb.classList.add('no-img');
    });
    img.addEventListener('load', function () {
      thumb.classList.remove('no-img');
    });
  });
}

// ============================================================
// LIGHTBOX dengan ZOOM (scroll, pinch, drag, tombol)
// ============================================================
let lbScale  = 1;
let lbMinScale = 0.5;
let lbMaxScale = 5;
let lbDragX  = 0, lbDragY  = 0;
let lbDragging = false;
let lbLastX  = 0, lbLastY  = 0;
// pinch
let lbLastDist = 0;

function lbApplyTransform() {
  const img = document.getElementById('lightboxImg');
  if (img) img.style.transform = `scale(${lbScale}) translate(${lbDragX / lbScale}px, ${lbDragY / lbScale}px)`;
}

function lbZoom(delta) {
  lbScale = Math.min(lbMaxScale, Math.max(lbMinScale, lbScale + delta));
  lbApplyTransform();
}

function lbZoomReset() {
  lbScale = 1; lbDragX = 0; lbDragY = 0;
  lbApplyTransform();
}

function openLightbox(src) {
  if (!src) return;
  const lb    = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightboxImg');
  lbScale = 1; lbDragX = 0; lbDragY = 0;
  lbImg.src = src;
  lbImg.style.transform = '';
  lb.classList.add('open');
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
}

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeLightbox();
  if (e.key === '+' || e.key === '=') lbZoom(0.25);
  if (e.key === '-') lbZoom(-0.25);
  if (e.key === '0') lbZoomReset();
});

// Klik backdrop lightbox untuk tutup (bukan wrap/img)
document.addEventListener('DOMContentLoaded', function () {
  const lb   = document.getElementById('lightbox');
  const wrap = document.getElementById('lightboxWrap');
  if (!lb || !wrap) return;

  // Tutup jika klik di luar wrap
  lb.addEventListener('click', function (e) {
    if (e.target === lb) closeLightbox();
  });

  // Scroll to zoom
  wrap.addEventListener('wheel', function (e) {
    e.preventDefault();
    lbZoom(e.deltaY < 0 ? 0.15 : -0.15);
  }, { passive: false });

  // Drag
  wrap.addEventListener('mousedown', function (e) {
    lbDragging = true; lbLastX = e.clientX; lbLastY = e.clientY;
    e.preventDefault();
  });
  document.addEventListener('mousemove', function (e) {
    if (!lbDragging) return;
    lbDragX += e.clientX - lbLastX;
    lbDragY += e.clientY - lbLastY;
    lbLastX = e.clientX; lbLastY = e.clientY;
    lbApplyTransform();
  });
  document.addEventListener('mouseup', function () { lbDragging = false; });

  // Pinch to zoom (touch)
  wrap.addEventListener('touchstart', function (e) {
    if (e.touches.length === 2) {
      lbLastDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    } else if (e.touches.length === 1) {
      lbDragging = true;
      lbLastX = e.touches[0].clientX; lbLastY = e.touches[0].clientY;
    }
  }, { passive: true });
  wrap.addEventListener('touchmove', function (e) {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (lbLastDist) lbZoom((dist - lbLastDist) * 0.01);
      lbLastDist = dist;
      e.preventDefault();
    } else if (e.touches.length === 1 && lbDragging) {
      lbDragX += e.touches[0].clientX - lbLastX;
      lbDragY += e.touches[0].clientY - lbLastY;
      lbLastX = e.touches[0].clientX; lbLastY = e.touches[0].clientY;
      lbApplyTransform();
    }
  }, { passive: false });
  wrap.addEventListener('touchend', function () { lbDragging = false; lbLastDist = 0; });
});

// ============================================================
// MUSIC PLAYER — file langsung dari folder musik/
// ============================================================
const audioPlayers     = {}; // index → Audio object
let   currentlyPlaying = null;

function initMusicCards() {
  document.querySelectorAll('.music-card-new').forEach(card => {
    const index  = parseInt(card.getAttribute('data-index'));
    const src    = card.getAttribute('data-src');
    const cover  = card.getAttribute('cover-src');

    // Pasang gambar cover jika ada
    const coverImg = card.querySelector('.music-cover-img');
    if (coverImg && cover && cover.trim() !== '') {
      coverImg.src = cover;
      coverImg.style.display = 'block';
    }

    // Buat Audio object jika src sudah diisi
    if (src && src.trim() !== '') {
      const audio = new Audio(src);
      audioPlayers[index] = audio;

      audio.addEventListener('loadedmetadata', () => updateTimeDisplay(index));
      audio.addEventListener('timeupdate',     () => updateProgress(index));
      audio.addEventListener('ended',          () => stopMusicCard(index));

      // Tandai card siap diplay
      card.setAttribute('data-ready', 'true');
    }
  });
}

function toggleMusicPlay(index) {
  const card  = document.querySelector(`.music-card-new[data-index="${index}"]`);
  const audio = audioPlayers[index];

  // Jika belum ada audio (src belum diisi di HTML)
  if (!audio) {
    showNoAudioHint(card);
    return;
  }

  const isPlaying = card.classList.contains('playing');

  if (isPlaying) {
    audio.pause();
    stopMusicCard(index);
  } else {
    // Stop kartu yang sedang main
    if (currentlyPlaying !== null && currentlyPlaying !== index) {
      const prev = audioPlayers[currentlyPlaying];
      if (prev) prev.pause();
      stopMusicCard(currentlyPlaying);
    }
    audio.play().catch(() => showNoAudioHint(card));
    card.classList.add('playing');
    currentlyPlaying = index;
  }
}

function stopMusicCard(index) {
  const card = document.querySelector(`.music-card-new[data-index="${index}"]`);
  if (card) card.classList.remove('playing');
  if (currentlyPlaying === index) currentlyPlaying = null;
}

function showNoAudioHint(card) {
  // Tampilkan notif kecil di kartu bahwa file belum dipasang
  let hint = card.querySelector('.no-audio-hint');
  if (!hint) {
    hint = document.createElement('div');
    hint.className = 'no-audio-hint';
    hint.textContent = 'File lagu belum dipasang di kode';
    card.querySelector('.music-card-info').appendChild(hint);
  }
  hint.classList.add('show');
  setTimeout(() => hint.classList.remove('show'), 2500);
}

function updateProgress(index) {
  const card  = document.querySelector(`.music-card-new[data-index="${index}"]`);
  const audio = audioPlayers[index];
  if (!card || !audio || !audio.duration) return;

  const pct  = (audio.currentTime / audio.duration) * 100;
  const fill = card.querySelector('.music-progress-fill');
  if (fill) fill.style.width = pct + '%';

  const cur = card.querySelector('.time-current');
  if (cur) cur.textContent = formatTime(audio.currentTime);
}

function updateTimeDisplay(index) {
  const card  = document.querySelector(`.music-card-new[data-index="${index}"]`);
  const audio = audioPlayers[index];
  if (!card || !audio) return;
  const tot = card.querySelector('.time-total');
  if (tot && audio.duration) tot.textContent = formatTime(audio.duration);
}

function seekAudio(index, event) {
  const audio = audioPlayers[index];
  if (!audio || !audio.duration) return;
  const bar  = event.currentTarget;
  const rect = bar.getBoundingClientRect();
  const pct  = (event.clientX - rect.left) / rect.width;
  audio.currentTime = pct * audio.duration;
}

function formatTime(secs) {
  if (isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return m + ':' + (s < 10 ? '0' : '') + s;
}
// ============================================================
// SOLO LEVELING — SYSTEM NOTIFICATION BADGE
// ============================================================
(function slSystemNotices() {
  const badge    = document.getElementById('slBadge');
  const badgeTxt = document.getElementById('slBadgeText');
  if (!badge) return;

  const notices = [
    '[ Quest Available ]',
    '[ You have leveled up ]',
    '[ A new dungeon has opened ]',
    '[ Shadow Army: Standby ]',
    '[ Arise ]',
    '[ System: All stats increased ]',
    '[ Hunter Reytox is online ]',
  ];

  let shown = false;

  function showNotice(text, delay) {
    setTimeout(() => {
      badgeTxt.textContent = text;
      badge.classList.add('show');
      setTimeout(() => badge.classList.remove('show'), 3000);
    }, delay);
  }

  // Tampilkan satu notice saat halaman pertama dibuka
  showNotice(notices[0], 1200);

  // Ganti notice setiap 12 detik
  let i = 1;
  setInterval(() => {
    showNotice(notices[i % notices.length], 0);
    i++;
  }, 12000);

  // Tampilkan notice berbeda saat ganti halaman
  const origGoToPage = window.goToPage;
  if (typeof origGoToPage === 'function') {
    window.goToPage = function(pageNum) {
      origGoToPage(pageNum);
      const pageNotices = {
        '1': '[ Returning to Base ]',
        '2': '[ Skill Tree Unlocked ]',
        '3': '[ Gallery Dungeon Entered ]',
        '4': '[ Hunter Profile Accessed ]',
      };
      if (pageNotices[String(pageNum)]) {
        showNotice(pageNotices[String(pageNum)], 300);
      }
    };
  }
})();

// ============================================================
// SOLO LEVELING FX — MANA PARTICLE CANVAS
// ============================================================
(function slManaCanvas() {
  const canvas = document.getElementById('sl-mana-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Particle pool
  const POOL = 120;
  const particles = [];

  function randBetween(a, b) { return a + Math.random() * (b - a); }

  function createParticle(forced) {
    const hue   = Math.random() > 0.5 ? 270 : 240;
    const light = Math.floor(randBetween(60, 85));
    return {
      x:       Math.random() * canvas.width,
      y:       forced ? canvas.height + 10 : Math.random() * canvas.height,
      size:    randBetween(1, 3.5),
      speedY:  randBetween(0.3, 1.2),
      speedX:  randBetween(-0.3, 0.3),
      alpha:   randBetween(0.3, 0.9),
      fade:    randBetween(0.002, 0.006),
      color:   `hsl(${hue},100%,${light}%)`,
      glow:    Math.random() > 0.6,  // bintang bercahaya
      twinkle: Math.random() * Math.PI * 2,
    };
  }

  for (let i = 0; i < POOL; i++) particles.push(createParticle(false));

  function drawFrame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.y       -= p.speedY;
      p.x       += p.speedX;
      p.alpha   -= p.fade;
      p.twinkle += 0.06;

      if (p.alpha <= 0 || p.y < -10) {
        particles[i] = createParticle(true);
        continue;
      }

      const twinkleAlpha = p.glow
        ? p.alpha * (0.6 + 0.4 * Math.sin(p.twinkle))
        : p.alpha;

      ctx.save();
      if (p.glow) {
        ctx.shadowBlur  = 10;
        ctx.shadowColor = p.color;
      }
      ctx.globalAlpha = twinkleAlpha;
      ctx.fillStyle   = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();

      // Garis vertikal kecil (mana streak)
      if (p.size > 2.2) {
        ctx.globalAlpha = twinkleAlpha * 0.4;
        ctx.strokeStyle = p.color;
        ctx.lineWidth   = 0.8;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.speedX * 6, p.y + p.speedY * 10);
        ctx.stroke();
      }
      ctx.restore();
    }

    requestAnimationFrame(drawFrame);
  }
  drawFrame();
})();

// ============================================================
// SOLO LEVELING FX — CURSOR AURA + TRAIL
// ============================================================
(function slCursorFX() {
  const aura  = document.getElementById('sl-cursor-aura');
  const trail = document.getElementById('sl-cursor-trail');
  if (!aura || !trail) return;

  let mx = -200, my = -200;
  let tx = -200, ty = -200;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    aura.style.left = mx + 'px';
    aura.style.top  = my + 'px';
  });

  // Trail mengikuti dengan delay
  function animTrail() {
    tx += (mx - tx) * 0.18;
    ty += (my - ty) * 0.18;
    trail.style.left = tx + 'px';
    trail.style.top  = ty + 'px';
    requestAnimationFrame(animTrail);
  }
  animTrail();

  // Expand aura saat hover elemen interaktif
  document.querySelectorAll('a, button, .skill-box, .gallery-card, .music-card-new, nav a').forEach(el => {
    el.addEventListener('mouseenter', () => {
      aura.style.width  = '70px';
      aura.style.height = '70px';
      aura.style.background = 'radial-gradient(circle, rgba(200,120,255,0.45) 0%, rgba(120,0,255,0.1) 60%, transparent 100%)';
    });
    el.addEventListener('mouseleave', () => {
      aura.style.width  = '40px';
      aura.style.height = '40px';
      aura.style.background = 'radial-gradient(circle, rgba(155,93,229,0.35) 0%, rgba(100,0,255,0.08) 60%, transparent 100%)';
    });
  });
})();

// ============================================================
// SOLO LEVELING FX — MANA RIPPLE ON CLICK
// ============================================================
document.addEventListener('click', function(e) {
  const ripple = document.createElement('div');
  ripple.className = 'sl-ripple';
  const size = 30;
  ripple.style.cssText = `
    left: ${e.clientX}px;
    top:  ${e.clientY}px;
    width: ${size}px;
    height: ${size}px;
  `;
  document.body.appendChild(ripple);
  setTimeout(() => ripple.remove(), 700);
});

// ============================================================
// SOLO LEVELING FX — RANDOM LIGHTNING FLASH
// ============================================================
(function slLightning() {
  const el = document.getElementById('sl-lightning');
  if (!el) return;

  function flash() {
    // Flash singkat 1-2x berturut-turut
    el.classList.add('flash');
    setTimeout(() => {
      el.classList.remove('flash');
      // Kadang flash lagi sekali
      if (Math.random() > 0.5) {
        setTimeout(() => {
          el.classList.add('flash');
          setTimeout(() => el.classList.remove('flash'), 60);
        }, 120);
      }
    }, 80);

    // Jadwalkan flash berikutnya (acak 8-25 detik)
    setTimeout(flash, randMs(8000, 25000));
  }

  function randMs(a, b) { return a + Math.random() * (b - a); }

  // Mulai setelah 5 detik
  setTimeout(flash, 5000);
})();

// ============================================================
// SOLO LEVELING FX — PAGE TRANSITION FLASH
// ============================================================
(function slPageFlash() {
  const overlay    = document.getElementById('pageFlash');
  if (!overlay) return;

  const origGoToPage = window.goToPage;
  if (typeof origGoToPage !== 'function') return;

  window.goToPage = function(pageNum) {
    // Flash saat transisi
    overlay.classList.add('active');
    setTimeout(() => overlay.classList.remove('active'), 220);
    origGoToPage(pageNum);
  };
})();

// ============================================================
// SOLO LEVELING FX — SCROLL REVEAL (elemen masuk dari bawah)
// ============================================================
(function slScrollReveal() {
  const targets = document.querySelectorAll(
    '.skill-box, .gallery-card, .music-card-new, .stat-item, .skill-chip, .about-quote, .contact-box'
  );

  if (!targets.length) return;

  // Set initial state
  targets.forEach(el => {
    el.style.opacity   = '0';
    el.style.transform = 'translateY(28px)';
    el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger delay berdasarkan posisi dalam parent
        const siblings = Array.from(entry.target.parentElement.children);
        const idx = siblings.indexOf(entry.target);
        setTimeout(() => {
          entry.target.style.opacity   = '1';
          entry.target.style.transform = 'translateY(0)';
        }, idx * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach(el => observer.observe(el));
})();

// ============================================================
// SOLO LEVELING FX — GLITCH TEXT pada heading sesekali
// ============================================================
(function slGlitchHeading() {
  const headings = document.querySelectorAll('.heading');
  if (!headings.length) return;

  headings.forEach(h => {
    h.style.position = 'relative';
    h.setAttribute('data-text', h.textContent);
  });

  // Inject glitch CSS sekali
  if (!document.getElementById('sl-glitch-style')) {
    const style = document.createElement('style');
    style.id = 'sl-glitch-style';
    style.textContent = `
      @keyframes sl-glitch-clip1 {
        0%   { clip-path: inset(40% 0 55% 0); transform: translate(-3px, 0); }
        20%  { clip-path: inset(10% 0 85% 0); transform: translate(3px, 0); }
        40%  { clip-path: inset(70% 0 5% 0);  transform: translate(-2px, 0); }
        60%  { clip-path: inset(30% 0 60% 0); transform: translate(2px, 0); }
        80%  { clip-path: inset(55% 0 25% 0); transform: translate(-1px, 0); }
        100% { clip-path: inset(40% 0 55% 0); transform: translate(0, 0); }
      }
      @keyframes sl-glitch-clip2 {
        0%   { clip-path: inset(55% 0 25% 0); transform: translate(3px, 0); }
        20%  { clip-path: inset(80% 0 5% 0);  transform: translate(-3px, 0); }
        40%  { clip-path: inset(20% 0 70% 0); transform: translate(2px, 0); }
        60%  { clip-path: inset(5% 0 85% 0);  transform: translate(-2px, 0); }
        80%  { clip-path: inset(65% 0 15% 0); transform: translate(1px, 0); }
        100% { clip-path: inset(55% 0 25% 0); transform: translate(0, 0); }
      }
      .sl-glitching::before,
      .sl-glitching::after {
        content: attr(data-text);
        position: absolute;
        inset: 0;
        pointer-events: none;
        font: inherit;
        color: inherit;
        letter-spacing: inherit;
      }
      .sl-glitching::before {
        color: #c77dff;
        animation: sl-glitch-clip1 0.35s steps(1) forwards;
      }
      .sl-glitching::after {
        color: #4cc9f0;
        animation: sl-glitch-clip2 0.35s steps(1) forwards;
      }
    `;
    document.head.appendChild(style);
  }

  function triggerGlitch() {
    const h = headings[Math.floor(Math.random() * headings.length)];
    h.classList.add('sl-glitching');
    setTimeout(() => h.classList.remove('sl-glitching'), 380);
    // Jadwalkan glitch berikutnya (acak 7-20 detik)
    setTimeout(triggerGlitch, 7000 + Math.random() * 13000);
  }

  setTimeout(triggerGlitch, 4000);
})();