/* =========================================================
   NOVA — Garry's Mod server site
   Все настройки сервера — в объекте CONFIG ниже.
   ========================================================= */
const CONFIG = {
  name: "NOVA",
  ip: "play.nova-gmod.ru:27015",
  discord: "https://discord.gg/your-invite",
  maxPlayers: 64,
  map: "rp_downtown_v4c",
  // URL, который отдаёт JSON вида { "online": 42, "max": 64, "map": "rp_downtown_v4c" }.
  // Пока пусто — на сайте показывается демо-онлайн.
  statusUrl: "",
  typer: ["строят города", "ловят предателей", "прячутся бочками", "взрывают пропы", "играют вместе"],
  team: [
    { name: "Kirill", role: "Основатель" },
    { name: "Mira", role: "Главный админ" },
    { name: "Dex", role: "Lua-разработчик" },
    { name: "Owl", role: "Маппер" },
  ],
};

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
const lerp = (a, b, t) => a + (b - a) * t;

/* ---------- Config → DOM ---------- */
$$("[data-server-name]").forEach((el) => (el.textContent = CONFIG.name));
$$("[data-server-ip]").forEach((el) => (el.textContent = CONFIG.ip));
$$("[data-max-players]").forEach((el) => (el.textContent = CONFIG.maxPlayers));
$$("[data-connect]").forEach((el) => (el.href = `steam://connect/${CONFIG.ip}`));
$$("[data-discord]").forEach((el) => { el.href = CONFIG.discord; el.target = "_blank"; el.rel = "noopener"; });
$(".glitch").dataset.text = CONFIG.name;
$("#heroMap").textContent = CONFIG.map;
$("#year").textContent = new Date().getFullYear();
document.title = `${CONFIG.name} — Garry's Mod сервер`;

/* ---------- Split text into chars / words ---------- */
function splitChars(el) {
  const text = el.textContent;
  el.textContent = "";
  [...text].forEach((ch, i) => {
    const s = document.createElement("span");
    s.className = "char";
    s.style.setProperty("--i", i);
    s.textContent = ch;
    el.appendChild(s);
  });
}
splitChars($(".glitch"));

$$(".split").forEach((el) => {
  const words = el.textContent.trim().split(/\s+/);
  el.textContent = "";
  words.forEach((w, i) => {
    const outer = document.createElement("span");
    outer.className = "word";
    const inner = document.createElement("span");
    inner.style.setProperty("--i", i);
    inner.textContent = w;
    outer.appendChild(inner);
    el.appendChild(outer);
    el.appendChild(document.createTextNode(" "));
  });
});

$$("[data-delay]").forEach((el) => el.style.setProperty("--d", el.dataset.delay));

/* ---------- Preloader ---------- */
(function preloader() {
  const count = $("#loadCount");
  const bar = $("#loadBar");
  let p = 0;
  let loaded = false;
  window.addEventListener("load", () => (loaded = true));
  setTimeout(() => (loaded = true), 3500); // страховка

  const tick = () => {
    const target = loaded ? 100 : 88;
    p = Math.min(target, p + Math.max(0.6, (target - p) * 0.06));
    count.textContent = Math.round(p);
    bar.style.width = p + "%";
    if (p >= 99.5) {
      count.textContent = 100;
      setTimeout(finish, 250);
    } else requestAnimationFrame(tick);
  };
  const finish = () => {
    $("#preloader").classList.add("is-done");
    document.body.classList.remove("is-loading");
    document.body.classList.add("is-ready");
    $$(".hero .reveal").forEach((el) => el.classList.add("is-in"));
    setTimeout(glitchLoop, 1600);
  };
  if (reduceMotion) { p = 99; }
  requestAnimationFrame(tick);
})();

/* ---------- Glitch title ---------- */
function glitchLoop() {
  const g = $(".glitch");
  if (reduceMotion) return;
  const fire = () => {
    g.classList.add("is-glitching");
    setTimeout(() => g.classList.remove("is-glitching"), 360);
    setTimeout(fire, 2200 + Math.random() * 3500);
  };
  fire();
}

/* ---------- Typer ---------- */
(function typer() {
  const el = $("#typer");
  const words = CONFIG.typer;
  let w = 0, i = words[0].length, deleting = true;
  const step = () => {
    const word = words[w];
    if (deleting) {
      i--;
      el.textContent = word.slice(0, i);
      if (i <= 0) { deleting = false; w = (w + 1) % words.length; }
      setTimeout(step, 40);
    } else {
      i++;
      el.textContent = words[w].slice(0, i);
      if (i >= words[w].length) { deleting = true; setTimeout(step, 2000); return; }
      setTimeout(step, 80);
    }
  };
  setTimeout(step, 3500);
})();

/* ---------- Custom cursor ---------- */
(function cursor() {
  if (!finePointer) return;
  const c = $("#cursor"), dot = $(".cursor__dot", c), ring = $(".cursor__ring", c);
  let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
  addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; });
  addEventListener("pointerdown", () => c.classList.add("is-down"));
  addEventListener("pointerup", () => c.classList.remove("is-down"));
  document.addEventListener("pointerover", (e) => {
    c.classList.toggle("is-hover", !!e.target.closest("a, button, summary, .shot, .mode"));
  });
  const loop = () => {
    rx = lerp(rx, mx, 0.18); ry = lerp(ry, my, 0.18);
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  };
  loop();
})();

/* ---------- Magnetic elements ---------- */
if (finePointer && !reduceMotion) {
  $$("[data-magnetic]").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
    });
    el.addEventListener("pointerleave", () => (el.style.transform = ""));
  });
}

/* ---------- Scroll: progress, nav hide, active link ---------- */
(function scroll() {
  const bar = $("#progress"), nav = $("#nav");
  let last = scrollY;
  const onScroll = () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
    const down = scrollY > last && scrollY > 300;
    nav.classList.toggle("is-hidden", down && !nav.classList.contains("is-open"));
    last = scrollY;
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const links = $$(".nav__links a");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + en.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  $$("main section[id]").forEach((s) => io.observe(s));
})();

/* ---------- Burger ---------- */
$("#burger").addEventListener("click", () => $("#nav").classList.toggle("is-open"));
$$(".nav__links a").forEach((a) => a.addEventListener("click", () => $("#nav").classList.remove("is-open")));

/* ---------- Reveal on scroll ---------- */
(function reveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });
  $$(".reveal, .split").forEach((el) => { if (!el.closest(".hero")) io.observe(el); });
})();

/* ---------- Counters ---------- */
(function counters() {
  const run = (el) => {
    const to = parseFloat(el.dataset.to);
    const dec = parseInt(el.dataset.decimals || "0", 10);
    const suf = el.dataset.suffix || "";
    const dur = 2000, t0 = performance.now();
    const fmt = (v) => v.toLocaleString("ru-RU", { minimumFractionDigits: dec, maximumFractionDigits: dec });
    const f = (t) => {
      const k = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - k, 4);
      el.textContent = fmt(to * e) + suf;
      if (k < 1) requestAnimationFrame(f);
    };
    requestAnimationFrame(f);
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } });
  }, { threshold: 0.5 });
  $$(".counter").forEach((el) => io.observe(el));
})();

/* ---------- 3D tilt cards ---------- */
if (finePointer && !reduceMotion) {
  $$(".tilt").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      card.style.transform = `rotateY(${(px - 0.5) * 14}deg) rotateX(${(0.5 - py) * 12}deg) translateZ(0)`;
      card.style.setProperty("--gx", px * 100 + "%");
      card.style.setProperty("--gy", py * 100 + "%");
    });
    card.addEventListener("pointerleave", () => (card.style.transform = ""));
  });
}

/* ---------- Spotlight on feature cards ---------- */
$$(".feature").forEach((f) => {
  f.addEventListener("pointermove", (e) => {
    const r = f.getBoundingClientRect();
    f.style.setProperty("--mx", e.clientX - r.left + "px");
    f.style.setProperty("--my", e.clientY - r.top + "px");
  });
});

/* ---------- Hero props parallax ---------- */
(function parallax() {
  if (reduceMotion) return;
  const props = $$(".prop");
  let tx = 0, ty = 0, cx = 0, cy = 0;
  addEventListener("pointermove", (e) => {
    tx = e.clientX / innerWidth - 0.5;
    ty = e.clientY / innerHeight - 0.5;
  });
  const loop = () => {
    cx = lerp(cx, tx, 0.06); cy = lerp(cy, ty, 0.06);
    const sy = Math.min(scrollY, innerHeight);
    props.forEach((p) => {
      const d = parseFloat(p.dataset.depth);
      p.style.transform = `translate3d(${cx * -80 * d}px, ${cy * -80 * d - sy * d * 0.6}px, 0)`;
    });
    requestAnimationFrame(loop);
  };
  loop();
})();

/* ---------- Hero canvas: particles + synthwave grid ---------- */
(function heroCanvas() {
  const canvas = $("#heroCanvas");
  const ctx = canvas.getContext("2d");
  let w, h, dpr, particles = [];
  const mouse = { x: -9999, y: -9999 };
  const colors = ["61,245,255", "123,92,255", "255,61,129"];

  const resize = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(110, (w * h) / 14000));
    particles = Array.from({ length: n }, () => ({
      x: Math.random() * w,
      y: Math.random() * h * 0.7,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.8 + 0.4,
      c: colors[(Math.random() * colors.length) | 0],
    }));
  };
  resize();
  addEventListener("resize", resize);
  canvas.parentElement.addEventListener("pointermove", (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
  });
  canvas.parentElement.addEventListener("pointerleave", () => { mouse.x = mouse.y = -9999; });

  let offset = 0, visible = true;
  new IntersectionObserver(([en]) => (visible = en.isIntersecting)).observe(canvas);

  const drawGrid = () => {
    const horizon = h * 0.62;
    const g = ctx.createLinearGradient(0, horizon, 0, h);
    g.addColorStop(0, "rgba(123,92,255,0)");
    g.addColorStop(1, "rgba(123,92,255,.45)");
    ctx.strokeStyle = g;
    ctx.lineWidth = 1;
    ctx.beginPath();
    const cx = w / 2;
    for (let i = -24; i <= 24; i++) {
      ctx.moveTo(cx + i * 8, horizon);
      ctx.lineTo(cx + i * w * 0.12, h);
    }
    offset = (offset + (reduceMotion ? 0 : 0.006)) % 1;
    for (let i = 0; i < 16; i++) {
      const t = (i + offset) / 16;
      const y = horizon + Math.pow(t, 2.6) * (h - horizon);
      ctx.moveTo(0, y); ctx.lineTo(w, y);
    }
    ctx.stroke();
  };

  const frame = () => {
    requestAnimationFrame(frame);
    if (!visible) return;
    ctx.clearRect(0, 0, w, h);
    drawGrid();
    for (const p of particles) {
      if (!reduceMotion) { p.x += p.vx; p.y += p.vy; }
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h * 0.75) p.vy *= -1;
      const dx = p.x - mouse.x, dy = p.y - mouse.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 160) {
        ctx.strokeStyle = `rgba(${p.c},${(1 - dist / 160) * 0.6})`;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        p.x += dx / dist * 0.6; p.y += dy / dist * 0.6;
      }
      ctx.fillStyle = `rgba(${p.c},.9)`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 100) {
          ctx.strokeStyle = `rgba(160,150,255,${(1 - d / 100) * 0.15})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
  };
  frame();
})();

/* ---------- Copy IP ---------- */
(function copyIp() {
  const btn = $("#ipCopy"), hint = $("#ipHint"), toast = $("#toast");
  btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(CONFIG.ip);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = CONFIG.ip; document.body.appendChild(ta); ta.select();
      document.execCommand("copy"); ta.remove();
    }
    hint.textContent = "готово ✓";
    toast.classList.add("is-show");
    setTimeout(() => { hint.textContent = "копировать"; toast.classList.remove("is-show"); }, 2000);
  });
})();

/* ---------- Server status ---------- */
(function status() {
  const online = $("#heroOnline"), map = $("#heroMap"), dot = $(".status-pill__dot");
  const show = (n, max, m) => {
    online.textContent = n;
    if (max) $$("[data-max-players]").forEach((el) => (el.textContent = max));
    if (m) map.textContent = m;
  };
  if (CONFIG.statusUrl) {
    const load = () => fetch(CONFIG.statusUrl)
      .then((r) => r.json())
      .then((d) => { dot.classList.remove("is-off"); show(d.online, d.max, d.map); })
      .catch(() => { dot.classList.add("is-off"); online.textContent = "offline"; });
    load();
    setInterval(load, 30000);
  } else {
    // Демо-режим: правдоподобно «гуляющий» онлайн
    let n = 38 + ((Math.random() * 14) | 0);
    show(n);
    setInterval(() => {
      n = Math.max(20, Math.min(CONFIG.maxPlayers, n + ((Math.random() * 5) | 0) - 2));
      show(n);
    }, 4000);
  }
})();

/* ---------- Team avatars (generated SVG) ---------- */
(function team() {
  const grid = $("#team-grid");
  const palettes = [["#3df5ff", "#7b5cff"], ["#ff3d81", "#ffb13d"], ["#7b5cff", "#ff3d81"], ["#3dff8a", "#3df5ff"]];
  CONFIG.team.forEach((m, idx) => {
    const [a, b] = palettes[idx % palettes.length];
    let seed = [...m.name].reduce((s, c) => s * 31 + c.charCodeAt(0), 7);
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    let cells = "";
    for (let y = 0; y < 5; y++) for (let x = 0; x < 3; x++) {
      if (rnd() > 0.5) {
        cells += `<rect x="${20 + x * 12}" y="${20 + y * 12}" width="12" height="12" fill="#fff" opacity=".9"/>`;
        if (x < 2) cells += `<rect x="${20 + (4 - x) * 12}" y="${20 + y * 12}" width="12" height="12" fill="#fff" opacity=".9"/>`;
      }
    }
    const card = document.createElement("div");
    card.className = "member reveal";
    card.style.setProperty("--d", idx);
    card.innerHTML = `
      <div class="member__ava">
        <svg viewBox="0 0 100 100"><defs><linearGradient id="av${idx}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
        <rect width="100" height="100" fill="url(#av${idx})"/>${cells}</svg>
      </div>
      <h3></h3><span></span>`;
    $("h3", card).textContent = m.name;
    $("span", card).textContent = m.role;
    grid.appendChild(card);
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
  }, { threshold: 0.15 });
  $$(".member", grid).forEach((el) => io.observe(el));
})();

/* ---------- Gallery: drag to scroll + lightbox ---------- */
(function gallery() {
  const track = $("#galleryTrack");
  const lb = $("#lightbox"), lbImg = $("#lightboxImg"), lbCap = $("#lightboxCap");
  let down = false, startX = 0, startScroll = 0, moved = 0;

  track.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse") return;
    down = true; moved = 0; startX = e.clientX; startScroll = track.scrollLeft;
    track.classList.add("is-drag");
  });
  addEventListener("pointermove", (e) => {
    if (!down) return;
    const dx = e.clientX - startX;
    moved = Math.max(moved, Math.abs(dx));
    track.scrollLeft = startScroll - dx;
  });
  addEventListener("pointerup", () => { down = false; track.classList.remove("is-drag"); });

  $$(".shot", track).forEach((shot) => {
    shot.addEventListener("click", () => {
      if (moved > 6) return;
      const img = $("img", shot);
      lbImg.src = img.src; lbImg.alt = img.alt;
      lbCap.textContent = $("figcaption", shot).textContent;
      lb.classList.add("is-open");
      lb.setAttribute("aria-hidden", "false");
    });
  });
  const close = () => { lb.classList.remove("is-open"); lb.setAttribute("aria-hidden", "true"); };
  lb.addEventListener("click", (e) => { if (e.target !== lbImg) close(); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
})();
