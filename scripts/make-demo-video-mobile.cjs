/**
 * Gera o vídeo de demonstração VERTICAL do AutoSystem (1080x1920, 60 fps) para Reels, Stories,
 * Shorts e WhatsApp.
 *
 * Como funciona
 *  - Abre o Chrome em tela cheia com um celular emulado (405x720 px, escala 1,5) no canto da tela e
 *    o ffmpeg grava essa área a 60 fps (608x1080 px reais, depois ampliados para 1080x1920).
 *    A tela fica ocupada durante a gravação (~2 min): não use o mouse nem o teclado.
 *  - Durante o carregamento de cada tela a gravação é marcada como pausada (a tela está coberta)
 *    e esse trecho é cortado depois, pelo horário exato, então não há esperas no vídeo.
 *  - Mostra um "dedo" (toque, arraste, rolagem) em vez de cursor, legendas pensadas para a
 *    vertical e abertura/encerramento no visual de oficina.
 *  - Codifica em BT.709 com bitrate alto; se DEMO_MUSIC apontar para um áudio, mistura com fade.
 *
 * Uso
 *   npm run demo:video:mobile
 *
 * Variáveis opcionais: as mesmas do vídeo de desktop (DEMO_BASE_URL, DEMO_EMAIL, DEMO_PASSWORD,
 * DEMO_MUSIC, DEMO_URL, DEMO_SKIP_BUILD, DEMO_OUT_DIR, FFMPEG_PATH) e
 *   KEEP_FRAMES=1     mantém a gravação bruta (mobile-raw.mkv)
 *   DEMO_SHOTS=1      salva uma captura de cada capítulo em <saída>/mobile-shots/
 */
"use strict";

const { chromium } = require("playwright-core");
const { spawnSync } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");
const base = require("./make-demo-video.cjs");
const { createScreenRecorder, encodeScreen } = require("./screen-recorder.cjs");

const { BASE, CREDS, CTA_URL, OUT_DIR, MUSIC, FFMPEG, FFPROBE } = base;

const OUT_W = 1080;
const OUT_H = 1920;
const VW = 405; // largura CSS do celular
const VH = 720; // altura CSS do celular
const DPR = 1.5; // 405x720 CSS x 1,5 = 608x1080 px: o máximo que cabe numa tela 1080p
const FPS = 60;
const TOTAL = 9;

const FINAL = path.join(OUT_DIR, "autosystem-demo-mobile.mp4");
const POSTER = path.join(OUT_DIR, "autosystem-demo-mobile-poster.jpg");
const RAW = path.join(OUT_DIR, "mobile-raw.mkv");
const SHOTS_DIR = path.join(OUT_DIR, "mobile-shots");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const rnd = (a, b) => a + Math.random() * (b - a);
const log = (...a) => console.log("[mobile]", ...a);

// ───────────────────────────── Camada visual (injetada no navegador) ─────────────────────────────

const overlayInit = () => {
  try {
    localStorage.setItem("pwa-prompt-dismissed", "1");
  } catch {}

  const boot = () => {
    if (document.getElementById("d-host")) return;
    const cs = getComputedStyle(document.body);
    const pick = (v, fb) => (cs.getPropertyValue(v) || "").trim() || fb;
    const host = document.createElement("div");
    host.id = "d-host";
    host.style.cssText =
      "--fi:" + pick("--font-barlow", "'Arial Narrow'") + ",'Arial Narrow',sans-serif;" +
      "--fs:" + pick("--font-inter", "system-ui") + ",system-ui,sans-serif;" +
      "--fm:" + pick("--font-jetbrains", "ui-monospace") + ",ui-monospace,monospace;";

    const style = document.createElement("style");
    style.textContent = `
      nextjs-portal{display:none!important}
      html{scrollbar-width:none}::-webkit-scrollbar{display:none}
      #d-host{position:fixed;inset:0;pointer-events:none;z-index:2147483000;font-family:var(--fs)}
      #d-host *{box-sizing:border-box}
      #d-cover{position:fixed;inset:0;opacity:0;background:var(--background,#fff);transition:opacity .2s ease;z-index:10}

      /* dedo */
      #d-dot{position:fixed;left:-80px;top:-80px;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;
        background:rgba(255,255,255,.55);border:2.5px solid rgba(17,19,23,.55);box-shadow:0 5px 16px rgba(0,0,0,.3);
        opacity:0;transform:scale(.6);transition:opacity .14s ease,transform .14s ease,left 0s,top 0s;z-index:100}
      #d-dot.on{opacity:1;transform:scale(1)}
      #d-dot.press{opacity:1;transform:scale(.8);background:rgba(34,197,94,.5)}
      .d-rip{position:fixed;width:16px;height:16px;margin:-8px 0 0 -8px;border-radius:50%;border:2.5px solid #22c55e;background:rgba(34,197,94,.22);z-index:99;animation:d-rip .6s ease-out forwards}
      @keyframes d-rip{from{transform:scale(.4);opacity:1}to{transform:scale(3.6);opacity:0}}

      /* destaque */
      #d-spot{position:fixed;z-index:50;border:2.5px solid #facc15;border-radius:12px;box-shadow:0 0 0 5px rgba(250,204,21,.22),0 10px 30px rgba(0,0,0,.25);opacity:0;transform:scale(1.03);transition:opacity .3s ease,transform .35s cubic-bezier(.16,1,.3,1)}
      #d-spot.on{opacity:1;transform:scale(1)}
      #d-spot b{position:absolute;left:-2.5px;bottom:calc(100% + 8px);background:#facc15;color:#18181b;font-family:var(--fm);font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;padding:5px 9px;border-radius:5px;white-space:nowrap}

      /* legenda (acima do dock) */
      #d-cap{position:fixed;left:12px;right:12px;bottom:84px;display:flex;align-items:stretch;z-index:60;opacity:0;transform:translateY(16px);transition:opacity .4s ease,transform .5s cubic-bezier(.16,1,.3,1);filter:drop-shadow(0 12px 24px rgba(0,0,0,.4))}
      #d-cap.on{opacity:1;transform:none}
      #d-cap .n{background:#facc15;color:#18181b;font-family:var(--fi);font-weight:700;font-size:30px;padding:0 14px;display:flex;align-items:center;border-radius:12px 0 0 12px}
      #d-cap .b{flex:1;background:rgba(14,16,20,.95);padding:10px 14px;border-radius:0 12px 12px 0}
      #d-cap .t{font-family:var(--fi);font-size:23px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;line-height:1.05;color:#fff}
      #d-cap .d{font-size:12.5px;font-weight:500;color:rgba(255,255,255,.76);margin-top:3px;line-height:1.3}

      #d-prog{position:fixed;left:0;top:0;height:3px;width:0;z-index:70;background:linear-gradient(90deg,#facc15,#22c55e);transition:width 1s cubic-bezier(.16,1,.3,1)}

      /* abertura e encerramento (vertical) */
      .d-card{position:fixed;inset:0;z-index:40;display:flex;align-items:center;justify-content:center;background:#0b0d10;opacity:0;visibility:hidden;transition:opacity .6s ease,visibility 0s linear .6s;overflow:hidden;color:#fff}
      .d-card.on{opacity:1;visibility:visible;transition:opacity .01s}
      .d-card .pegs{position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.09) 1.6px,transparent 2px);background-size:22px 22px;-webkit-mask-image:radial-gradient(ellipse at center,#000 25%,transparent 78%);mask-image:radial-gradient(ellipse at center,#000 25%,transparent 78%)}
      .d-card .hz{position:absolute;left:0;width:100%;height:18px;background:repeating-linear-gradient(-45deg,#facc15 0 14px,#18181b 14px 28px);opacity:0}
      .d-card .hz.t{top:0}.d-card .hz.b{bottom:0}
      .d-card.on .hz.t{animation:d-hzl 1.1s cubic-bezier(.16,1,.3,1) .05s forwards}
      .d-card.on .hz.b{animation:d-hzr 1.1s cubic-bezier(.16,1,.3,1) .05s forwards}
      @keyframes d-hzl{from{opacity:0;transform:translateX(-10%)}to{opacity:1;transform:none}}
      @keyframes d-hzr{from{opacity:0;transform:translateX(10%)}to{opacity:1;transform:none}}
      .d-card .c{position:relative;display:flex;flex-direction:column;align-items:center;gap:20px;text-align:center;padding:0 22px}
      .d-card .w{font-family:var(--fi);font-weight:700;font-size:74px;line-height:.9;letter-spacing:.03em;display:flex}
      .d-card .w i{font-style:normal;opacity:0}
      .d-card .w i.g{color:#22c55e}
      .d-card.on .w i{animation:d-up .7s cubic-bezier(.16,1,.3,1) forwards}
      @keyframes d-up{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
      .d-card .plate{font-family:var(--fm);font-weight:700;font-size:22px;letter-spacing:.14em;color:#111;background:#fff;border-top:8px solid #1e40af;padding:4px 18px 3px;border-radius:7px;opacity:0;box-shadow:0 10px 24px rgba(0,0,0,.4)}
      .d-card.on .plate{animation:d-pop .6s cubic-bezier(.16,1,.3,1) .5s forwards}
      @keyframes d-pop{from{opacity:0;transform:scale(.7) rotate(-6deg)}to{opacity:1;transform:scale(1) rotate(-2deg)}}
      .d-card .s{font-family:var(--fm);font-size:11.5px;letter-spacing:.28em;text-transform:uppercase;color:rgba(255,255,255,.62);opacity:0;line-height:1.7}
      .d-card.on .s{animation:d-up .7s ease 1.35s forwards}
      .d-card .line{font-family:var(--fi);font-weight:700;font-size:35px;letter-spacing:.04em;text-transform:uppercase;line-height:1.02;text-wrap:balance;opacity:0}
      .d-card.on .line{animation:d-up .7s ease .9s forwards}
      .d-card .chips{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;opacity:0}
      .d-card.on .chips{animation:d-up .7s ease 1.2s forwards}
      .d-card .chip{background:#facc15;color:#18181b;font-family:var(--fm);font-weight:700;font-size:11px;letter-spacing:.08em;text-transform:uppercase;padding:6px 10px}
      .d-card .cta{display:flex;flex-direction:column;align-items:center;gap:12px;opacity:0}
      .d-card.on .cta{animation:d-up .7s ease 1.7s forwards}
      .d-card .btn{background:#22c55e;color:#06210f;font-weight:700;font-size:17px;padding:12px 22px;border-radius:10px}
      .d-card .url{font-family:var(--fm);font-size:14px;letter-spacing:.04em;color:rgba(255,255,255,.88)}
    `;
    document.head.appendChild(style);

    host.innerHTML =
      '<div id="d-cover"></div>' +
      '<div class="d-card" id="d-intro"></div>' +
      '<div class="d-card" id="d-outro"></div>' +
      '<div id="d-spot"></div><div id="d-cap"></div><div id="d-prog"></div><div id="d-dot"></div>';
    document.documentElement.appendChild(host);

    const $ = (id) => document.getElementById(id);
    const cover = $("d-cover");
    const dot = $("d-dot");
    let capTimer = 0;
    let down = false;

    const place = (x, y, ms) => {
      dot.style.transition = "opacity .14s ease,transform .14s ease,left " + ms + "ms ease-out,top " + ms + "ms ease-out";
      dot.style.left = x + "px";
      dot.style.top = y + "px";
    };
    const ripple = (x, y) => {
      const r = document.createElement("div");
      r.className = "d-rip";
      r.style.left = x + "px";
      r.style.top = y + "px";
      host.appendChild(r);
      setTimeout(() => r.remove(), 650);
    };

    // O dedo acompanha o mouse enquanto o botão estiver apertado (toque e arraste).
    window.addEventListener("mousedown", (e) => {
      down = true;
      place(e.clientX, e.clientY, 0);
      dot.className = "press";
      ripple(e.clientX, e.clientY);
    }, true);
    window.addEventListener("mousemove", (e) => {
      if (down) place(e.clientX, e.clientY, 0);
    }, true);
    window.addEventListener("mouseup", () => {
      down = false;
      setTimeout(() => { if (!down) dot.className = ""; }, 140);
    }, true);

    const wordmark = () =>
      "AUTOSYSTEM".split("").map((ch, i) =>
        '<i class="' + (i >= 4 ? "g" : "") + '" style="animation-delay:' + (200 + i * 55) + 'ms">' + ch + "</i>"
      ).join("");

    // Evita a barrinha de URL do Chrome sobre links: tira o href enquanto o ponteiro está em cima e o
    // devolve ao sair. Os links do app são <Link> do Next, que navegam sem depender do atributo.
    document.addEventListener("mouseover", (e) => {
      const a = e.target.closest && e.target.closest("a[href]");
      if (a) {
        a.dataset.dh = a.getAttribute("href");
        a.removeAttribute("href");
      }
    }, true);
    document.addEventListener("mouseout", (e) => {
      const a = e.target.closest && e.target.closest("a[data-dh]");
      if (a && !(e.relatedTarget && a.contains(e.relatedTarget))) {
        a.setAttribute("href", a.dataset.dh);
        delete a.dataset.dh;
      }
    }, true);

    window.__demo = {
      cover(on, o) {
        o = o || {};
        cover.style.background = o.color || "var(--background,#fff)";
        cover.style.transitionDuration = (o.ms == null ? 200 : o.ms) + "ms";
        cover.style.opacity = on ? "1" : "0";
        if (on) sessionStorage.setItem("demo:cover", o.color || "var(--background,#fff)");
        else sessionStorage.removeItem("demo:cover");
      },
      spot(rect, label) {
        const s = $("d-spot");
        const pad = 7;
        s.style.left = rect.x - pad + "px";
        s.style.top = rect.y - pad + "px";
        s.style.width = rect.w + pad * 2 + "px";
        s.style.height = rect.h + pad * 2 + "px";
        s.innerHTML = label ? "<b>" + label + "</b>" : "";
        s.classList.add("on");
      },
      unspot() { $("d-spot").classList.remove("on"); },
      cap(n, title, desc, ms) {
        const c = $("d-cap");
        c.innerHTML = '<div class="n">' + String(n).padStart(2, "0") + '</div><div class="b"><div class="t">' + title + '</div><div class="d">' + (desc || "") + "</div></div>";
        c.classList.add("on");
        clearTimeout(capTimer);
        capTimer = setTimeout(() => c.classList.remove("on"), ms || 5200);
      },
      capHide() { clearTimeout(capTimer); $("d-cap").classList.remove("on"); },
      progress(p) { $("d-prog").style.width = Math.round(p * 100) + "%"; },
      // dedo "no ar": aproxima-se do alvo antes do toque
      approach(x, y, fromDy, ms) {
        place(x, y + fromDy, 0);
        dot.className = "";
        void dot.offsetWidth;
        dot.className = "on";
        place(x, y, ms);
      },
      dotMove(x, y, ms) { dot.className = "on"; place(x, y, ms); },
      dotHide() { dot.className = ""; },
      intro() {
        const el = $("d-intro");
        el.classList.remove("on");
        el.innerHTML = '<div class="pegs"></div><div class="hz t"></div><div class="hz b"></div><div class="c"><div class="w">' + wordmark() + '</div><div class="plate">KDF5M78</div><div class="s">Gestão para<br>oficinas mecânicas</div></div>';
        void el.offsetWidth;
        el.classList.add("on");
      },
      introOut() { $("d-intro").classList.remove("on"); },
      outro(cta, url) {
        const el = $("d-outro");
        el.classList.remove("on");
        el.innerHTML = '<div class="pegs"></div><div class="hz t"></div><div class="hz b"></div><div class="c"><div class="w">' + wordmark() + '</div><div class="line">Do orçamento à entrega, sem papel solto na bancada.</div><div class="chips"><span class="chip">Orçamentos</span><span class="chip">Ordens de serviço</span><span class="chip">Estoque</span><span class="chip">Financeiro</span></div><div class="cta"><span class="btn">' + cta + '</span><span class="url">' + url + "</span></div></div>";
        void el.offsetWidth;
        el.classList.add("on");
      },
    };

    // Cortina escura na primeira carga e persistente entre navegações completas.
    const stored = sessionStorage.getItem("demo:cover");
    const first = !sessionStorage.getItem("demo:started");
    if (first) sessionStorage.setItem("demo:started", "1");
    if (stored || first) {
      cover.style.transition = "none";
      cover.style.background = stored || "#0b0d10";
      cover.style.opacity = "1";
      void cover.offsetWidth;
      cover.style.transition = "";
      if (first) sessionStorage.setItem("demo:cover", "#0b0d10");
    }
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
};

// ───────────────────────────── Movimento e interação ─────────────────────────────

async function smoothScroll(page, y, ms = 900) {
  await page.evaluate(
    ([target, d]) =>
      new Promise((resolve) => {
        const start = window.scrollY;
        const t0 = performance.now();
        const e = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
        const step = (now) => {
          const p = Math.min(1, (now - t0) / d);
          window.scrollTo(0, start + (target - start) * e(p));
          if (p < 1) requestAnimationFrame(step);
          else resolve();
        };
        requestAnimationFrame(step);
      }),
    [Math.max(0, Math.round(y)), Math.max(60, ms)],
  );
}

/** Rolagem com o dedo arrastando na tela (o dedo sobe enquanto a página desce). */
async function swipe(page, dy, ms = 1000) {
  const cur = await page.evaluate(() => window.scrollY);
  const x = VW * 0.6;
  const y0 = VH * 0.66;
  const travel = Math.min(Math.abs(dy), VH * 0.4) * (dy >= 0 ? 1 : -1);
  await page.evaluate(([a, b]) => window.__demo.approach(a, b, 0, 0), [x, y0]);
  await sleep(150);
  await Promise.all([
    page.evaluate(([a, b, m]) => window.__demo.dotMove(a, b, m), [x, y0 - travel, ms]),
    smoothScroll(page, cur + dy, ms),
  ]);
  await page.evaluate(() => window.__demo.dotHide());
  await sleep(250);
}

async function scrollToSelector(page, selector, offset = 70, ms = 1100) {
  const y = await page.evaluate(
    ([sel, off]) => {
      const el = document.querySelector(sel);
      return el ? el.getBoundingClientRect().top + window.scrollY - off : 0;
    },
    [selector, offset],
  );
  await smoothScroll(page, y, ms);
}

async function reveal(page, loc, margin = 140) {
  const b = await loc.boundingBox().catch(() => null);
  if (!b) return;
  if (b.y < margin || b.y + b.height > VH - 110) {
    const cur = await page.evaluate(() => window.scrollY);
    await smoothScroll(page, cur + b.y - VH * 0.38, 800);
    await sleep(150);
  }
}

async function targetPoint(loc) {
  const b = await loc.boundingBox().catch(() => null);
  if (!b) throw new Error("elemento sem posição");
  return { x: b.x + b.width / 2, y: b.y + b.height / 2, b };
}

/** Toque simples: o dedo se aproxima, aperta e solta. */
async function tap(page, loc, { pause = 220 } = {}) {
  await reveal(page, loc);
  const { x, y } = await targetPoint(loc);
  await page.evaluate(([a, b]) => window.__demo.approach(a, b, 46, 240), [x, y]);
  await sleep(240 + pause);
  await page.mouse.move(x, y);
  await page.mouse.down();
  await sleep(100);
  await page.mouse.up();
  await sleep(260);
}

async function typeText(page, text, { min = 55, max = 115 } = {}) {
  for (const ch of text) {
    await page.keyboard.type(ch);
    await sleep(rnd(min, max));
  }
}

async function settle(page, extra = 350) {
  await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {});
  await page
    .waitForFunction(
      () => {
        const main = document.querySelector("main");
        if (!main) return document.readyState === "complete";
        return !main.querySelector('[data-slot="skeleton"]') && main.innerText.trim().length > 20;
      },
      null,
      { timeout: 15000 },
    )
    .catch(() => {});
  await page.waitForLoadState("networkidle", { timeout: 6000 }).catch(() => {});
  await sleep(extra);
}

async function spotEl(page, loc, label, { hold = 2200 } = {}) {
  const b = await loc.boundingBox().catch(() => null);
  if (!b) return;
  await page.evaluate(([r, l]) => window.__demo.spot(r, l), [{ x: b.x, y: b.y, w: b.width, h: b.height }, label]);
  await sleep(hold);
  await page.evaluate(() => window.__demo.unspot());
  await sleep(250);
}

const cap = (page, n, title, desc, ms) =>
  page.evaluate(([a, b, c, d]) => window.__demo.cap(a, b, c, d), [n, title, desc, ms]);
const progress = (page, n) => page.evaluate((p) => window.__demo.progress(p), n / TOTAL);

// ───────────────────────────── Transições (captura pausada sob a cortina) ─────────────────────────────

let rec = null;

/** Toca num alvo que troca de tela: a captura é pausada enquanto a cortina está fechada. */
async function tapTransition(page, loc, { url, ready } = {}) {
  await reveal(page, loc);
  const { x, y } = await targetPoint(loc);
  await page.evaluate(([a, b]) => window.__demo.approach(a, b, 46, 240), [x, y]);
  await sleep(480);
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.evaluate(() => window.__demo.cover(true, { ms: 130 }));
  await sleep(180);
  rec.pause();
  await page.mouse.up();
  if (url) await page.waitForURL(url, { timeout: 30000 }).catch(() => {});
  if (ready) await page.waitForSelector(ready, { timeout: 30000 }).catch(() => {});
  await settle(page, 450);
  rec.resume();
  await page.evaluate(() => window.__demo.cover(false, { ms: 260 }));
  await sleep(450);
}

/** Navegação direta (sem toque), por exemplo para a página pública de assinatura. */
async function goTransition(page, url, ready) {
  await page.evaluate(() => window.__demo.cover(true, { ms: 150 }));
  await sleep(200);
  rec.pause();
  await page.goto(BASE + url, { waitUntil: "domcontentloaded" });
  if (ready) await page.waitForSelector(ready, { timeout: 30000 }).catch(() => {});
  await settle(page, 600);
  rec.resume();
  await page.evaluate(() => window.__demo.cover(false, { ms: 260 }));
  await sleep(450);
}

const dockLink = (page, href) => page.locator(`nav[aria-label="Navegação principal"] a[href="${href}"]`).first();
const dockButton = (page, name) =>
  page.locator('nav[aria-label="Navegação principal"] button').filter({ hasText: name }).first();

// ───────────────────────────── Edição ─────────────────────────────

function minimizeWindows(minimize) {
  const method = minimize ? "MinimizeAll" : "UndoMinimizeALL";
  spawnSync("powershell", ["-NoProfile", "-Command", `(New-Object -ComObject Shell.Application).${method}()`], {
    stdio: "ignore",
  });
}

function encode() {
  const r = encodeScreen({
    rec,
    raw: RAW,
    out: FINAL,
    width: OUT_W,
    height: OUT_H,
    fps: FPS,
    crf: 15,
    preset: "slow",
    level: "4.2",
    music: MUSIC,
    ffmpeg: FFMPEG,
    ffprobe: FFPROBE,
    poster: POSTER,
    posterAt: 3.2,
    log,
  });
  if (r.ok && process.env.KEEP_FRAMES !== "1") fs.rmSync(RAW, { force: true });
  return r;
}

// ───────────────────────────── Roteiro ─────────────────────────────

async function run() {
  const ids = { budget: null, service: null };
  await base.ensureServer();
  await base.discover(ids);

  // Chrome visível em tela cheia com um celular emulado no canto: o ffmpeg grava só essa área (608x1080
  // px reais) a 60 fps. Durante a gravação a tela fica ocupada: não use o mouse nem o teclado.
  // As outras janelas são minimizadas (o Windows não deixa um programa de fundo passar à frente) e
  // restauradas no fim.
  minimizeWindows(true);
  await sleep(1200);
  const browser = await chromium.launch({
    channel: "chrome",
    headless: false,
    ignoreDefaultArgs: ["--enable-automation"],
    args: [
      "--window-position=0,0",
      "--window-size=1920,1080",
      `--force-device-scale-factor=${DPR}`,
      "--hide-scrollbars",
      "--disable-infobars",
      "--no-first-run",
    ],
  });
  let recording = false;
  try {
    const context = await browser.newContext({
      viewport: null,
      locale: "pt-BR",
      timezoneId: "America/Sao_Paulo",
      colorScheme: "light",
    });
    await context.addInitScript(overlayInit);
    const page = await context.newPage();
    page.setDefaultTimeout(25000);
    const cdp = await context.newCDPSession(page);
    const { windowId } = await cdp.send("Browser.getWindowForTarget");
    await cdp.send("Browser.setWindowBounds", { windowId, bounds: { windowState: "fullscreen" } });
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: VW, height: VH, deviceScaleFactor: 0, mobile: true });
    await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: true });
    await page.bringToFront();
    await sleep(5000); // o aviso "tela cheia" do Chrome some sozinho
    rec = createScreenRecorder({
      ffmpeg: FFMPEG,
      ffprobe: FFPROBE,
      region: { x: 0, y: 0, width: Math.round(VW * DPR), height: Math.round(VH * DPR) },
      raw: RAW,
      fps: FPS,
    });

    await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    await settle(page, 600);
    const vp = await page.evaluate(() => ({ w: innerWidth, h: innerHeight, dpr: devicePixelRatio }));
    log("Janela:", JSON.stringify(vp), "→ saída", `${OUT_W}x${OUT_H}`);

    if (process.env.DEMO_SHOTS === "1") fs.mkdirSync(SHOTS_DIR, { recursive: true });
    const shot = async (name) => {
      if (process.env.DEMO_SHOTS === "1") await page.screenshot({ path: path.join(SHOTS_DIR, name + ".png") });
    };

    await rec.start();
    recording = true;
    await sleep(500);

    const scene = async (name, fn) => {
      log("cena:", name);
      try {
        await fn();
      } catch (e) {
        log(`erro na cena "${name}":`, e.message.split("\n")[0]);
        rec.resume();
        await page.evaluate(() => {
          window.__demo.unspot();
          window.__demo.dotHide();
          window.__demo.cover(false, { ms: 150 });
        }).catch(() => {});
      }
      await shot("cena-" + name.replace(/\W+/g, "-"));
    };

    // ── Abertura ──
    await scene("abertura", async () => {
      await page.evaluate(() => window.__demo.intro());
      await sleep(3200);
      await page.evaluate(() => window.__demo.introOut());
      await sleep(600);
      rec.pause();
      await page.reload({ waitUntil: "domcontentloaded" });
      await settle(page, 300);
      rec.resume();
      await page.evaluate(() => window.__demo.cover(false, { ms: 700 }));
      await sleep(900);
    });

    // ── 1. Landing ──
    await scene("landing", async () => {
      await progress(page, 1);
      await cap(page, 1, "Conheça o AutoSystem", "Do orçamento à entrega, sem papel solto na bancada.", 4200);
      await sleep(1400);
      await swipe(page, 330, 900);
      await sleep(1100);
      await scrollToSelector(page, "#caminho", 70, 1100);
      await sleep(500);
      await swipe(page, 300, 900);
      await sleep(400);
      await scrollToSelector(page, "#bancada", 70, 1100);
      await sleep(1200);
      await smoothScroll(page, 0, 1000);
      await sleep(300);
    });

    // ── 2. Login ──
    await scene("login", async () => {
      await progress(page, 2);
      await tapTransition(page, page.locator('header a[href="/auth"]').first(), {
        url: "**/auth",
        ready: 'input[type="email"]',
      });
      await cap(page, 2, "Acesso seguro", "Entre com e-mail e senha em segundos.", 4200);
      await sleep(800);
      await tap(page, page.getByRole("tab", { name: "Criar conta" }));
      await sleep(900);
      await tap(page, page.getByRole("tab", { name: "Entrar" }));
      await sleep(400);
      await tap(page, page.getByLabel("E-mail", { exact: true }));
      await typeText(page, CREDS.email, { min: 40, max: 80 });
      await sleep(200);
      await tap(page, page.getByLabel("Senha", { exact: true }));
      await typeText(page, CREDS.password, { min: 55, max: 100 });
      await sleep(300);
      await tapTransition(page, page.getByRole("button", { name: /^entrar$/i }), {
        url: "**/dashboard",
        ready: 'nav[aria-label="Navegação principal"]',
      });
    });

    // ── 3. Dashboard ──
    await scene("dashboard", async () => {
      await progress(page, 3);
      await cap(page, 3, "Visão geral", "Orçamentos, clientes e faturamento no seu bolso.", 4200);
      await sleep(1300);
      await swipe(page, 240, 900);
      await sleep(400);
      const list = page.locator("ul.divide-y").first();
      if (await list.count()) await spotEl(page, list, "Aguardando aprovação", { hold: 1700 });
      await smoothScroll(page, 0, 800);
      await sleep(300);
    });

    // ── 4. Criar novo ──
    await scene("criar", async () => {
      await progress(page, 4);
      await cap(page, 4, "Cadastro em um toque", "Orçamento, cliente, veículo e produto pelo botão +.", 3800);
      await tap(page, page.locator('nav[aria-label="Navegação principal"] button[aria-label="Criar novo"]'));
      await page.getByRole("dialog").waitFor({ state: "visible" }).catch(() => {});
      await sleep(1700);
      await page.keyboard.press("Escape");
      await sleep(600);
    });

    // ── 5. Orçamentos ──
    await scene("orcamentos", async () => {
      await progress(page, 5);
      await tapTransition(page, dockLink(page, "/dashboard/budget"), { url: (u) => u.pathname === "/dashboard/budget" });
      await cap(page, 5, "Orçamentos", "Monte, envie pelo WhatsApp e acompanhe a aprovação.", 4200);
      await sleep(1200);
      await swipe(page, 330, 900);
      await sleep(400);
      await smoothScroll(page, 0, 800);
      await sleep(300);
      if (ids.budget) {
        await tapTransition(page, page.locator(`a[href="${ids.budget}"]`).first(), { url: "**" + ids.budget });
        await sleep(700);
        await swipe(page, 330, 1000);
        await sleep(900);
      }
    });

    // ── 6. Cliente assina ──
    await scene("assinatura", async () => {
      await progress(page, 6);
      if (!ids.budget) return;
      await goTransition(page, "/budget/sign/" + ids.budget.split("/").pop(), "canvas");
      await cap(page, 6, "O cliente assina", "Pelo link, no celular dele. Sem imprimir nada.", 4800);
      await sleep(1200);
      await scrollToSelector(page, "canvas", 280, 1100);
      await sleep(500);
      const box = await page.locator("canvas").first().boundingBox();
      if (box) {
        const sx = box.x + box.width * 0.14;
        const sy = box.y + box.height * 0.58;
        await page.evaluate(([a, b]) => window.__demo.approach(a, b, 46, 260), [sx, sy]);
        await sleep(520);
        await page.mouse.move(sx, sy);
        await page.mouse.down();
        for (let i = 0; i <= 52; i++) {
          const t = i / 52;
          await page.mouse.move(
            sx + t * box.width * 0.7,
            sy + Math.sin(t * Math.PI * 4.2) * box.height * 0.2 * (1 - t * 0.35) - Math.sin(t * Math.PI) * 10,
          );
          await sleep(16);
        }
        await page.mouse.up();
      }
      await sleep(700);
      const btn = page.getByRole("button", { name: /confirmar e aprovar/i });
      if (await btn.count()) {
        await reveal(page, btn, 200);
        await spotEl(page, btn, "Aprovação em um toque", { hold: 1800 });
      }
    });

    // ── 7. Ordens de serviço ──
    await scene("ordens", async () => {
      await progress(page, 7);
      await goTransition(page, "/dashboard/service", 'nav[aria-label="Navegação principal"]');
      await cap(page, 7, "Ordens de serviço", "Cada orçamento aprovado vira uma O.S. até a entrega.", 4200);
      await sleep(1200);
      await swipe(page, 300, 900);
      await sleep(400);
      await smoothScroll(page, 0, 700);
      if (ids.service) {
        await tapTransition(page, page.locator(`a[href="${ids.service}"]`).first(), { url: "**" + ids.service });
        await sleep(700);
        const fin = page.getByRole("button", { name: /Finalizar O\.S\./ });
        if (await fin.count()) await spotEl(page, fin, "Finaliza e lança no financeiro", { hold: 1800 });
      }
    });

    // ── 8. Estoque e financeiro pelo menu "Mais" ──
    await scene("mais", async () => {
      await progress(page, 8);
      await cap(page, 8, "Estoque e financeiro", "Tudo a um toque no menu Mais.", 4000);
      await tap(page, dockButton(page, "Mais"));
      await page.getByRole("dialog").waitFor({ state: "visible" }).catch(() => {});
      await sleep(1300);
      await tapTransition(page, page.getByRole("dialog").locator('a[href="/dashboard/product"]'), {
        url: (u) => u.pathname === "/dashboard/product",
      });
      await sleep(700);
      await tap(page, page.getByRole("tab", { name: /Baixo/ }));
      await sleep(1000);
      await swipe(page, 300, 900);
      await sleep(300);
      await smoothScroll(page, 0, 700);
      await tap(page, dockButton(page, "Mais"));
      await page.getByRole("dialog").waitFor({ state: "visible" }).catch(() => {});
      await sleep(600);
      await tapTransition(page, page.getByRole("dialog").locator('a[href="/dashboard/financeiro"]'), {
        url: (u) => u.pathname === "/dashboard/financeiro",
      });
      await sleep(900);
      await swipe(page, 280, 900);
      await sleep(600);
      await smoothScroll(page, 0, 700);
    });

    // ── 9. Tema ──
    await scene("tema", async () => {
      await progress(page, 9);
      await cap(page, 9, "Claro e escuro", "Escolha o visual que cansa menos a vista.", 3800);
      await sleep(700);
      await tap(page, page.locator('header button[aria-label="Usar tema escuro"]'));
      await sleep(1700);
      await tapTransition(page, dockLink(page, "/dashboard"), { url: (u) => u.pathname === "/dashboard" });
      await sleep(1200);
    });

    // ── Encerramento ──
    await scene("encerramento", async () => {
      await page.evaluate(() => {
        window.__demo.capHide();
        window.__demo.dotHide();
      });
      await progress(page, TOTAL);
      await sleep(400);
      await page.evaluate(([c, u]) => window.__demo.outro(c, u), ["Teste grátis por 14 dias", CTA_URL]);
      await sleep(4400);
      await page.evaluate(() => window.__demo.cover(true, { color: "#0b0d10", ms: 900 }));
      await sleep(1100);
    });
  } catch (err) {
    console.error("ERRO NO VÍDEO MOBILE:", err.message);
    process.exitCode = 1;
  } finally {
    if (recording) await rec.stop();
    await browser.close().catch(() => {});
    minimizeWindows(false);
    base.stopServer();
    await sleep(300);
    if (recording) encode();
  }
}

if (require.main === module) {
  run().catch((e) => {
    console.error(e);
    base.stopServer();
    process.exit(1);
  });
}

void FFMPEG;

module.exports = { overlayInit };
