/**
 * Gera o vídeo de demonstração do AutoSystem (1080p, 30 fps).
 *
 * Como funciona
 *  1. Sobe (ou reaproveita) o servidor. Se não estiver rodando, faz `next build` + `next start`.
 *  2. Aquece todas as rotas e descobre os IDs usados no roteiro.
 *  3. Abre um Chrome INVISÍVEL em 1920x1080 e captura cada quadro em PNG sem perdas, conduzindo o
 *     app com cursor suave, legendas, destaques e transições. A captura é pausada enquanto a tela
 *     está coberta (carregamentos), então não há esperas no vídeo.
 *  4. Codifica o MP4 em BT.709 limitado, com bitrate alto. Se DEMO_MUSIC apontar para um áudio,
 *     mistura com fade de entrada e saída.
 *
 * Uso
 *   npm run demo:video
 *
 * A gravação roda em segundo plano e não usa a sua tela: pode continuar trabalhando.
 *
 * Variáveis opcionais
 *   DEMO_BASE_URL     URL do app (padrão http://localhost:3000)
 *   DEMO_EMAIL / DEMO_PASSWORD   conta usada no login
 *   DEMO_MUSIC        caminho de um áudio (mp3/wav/m4a) para trilha sonora
 *   DEMO_URL          endereço mostrado no encerramento (padrão autosystem.nulldev.com.br)
 *   DEMO_SKIP_BUILD=1 reaproveita o build existente em vez de gerar um novo
 *   DEMO_ONLY=a,b     roda só as cenas indicadas, ex.: login,orcamentos,celular
 *   DEMO_SHOTS=1      salva uma captura de cada capítulo em <saída>/shots/
 *   DEMO_OUT_DIR      pasta de saída (padrão: videos/)
 *   KEEP_FRAMES=1     mantém os quadros PNG da gravação
 *   FFMPEG_PATH       caminho do ffmpeg
 */
"use strict";

const { chromium } = require("playwright-core");
const { spawn, spawnSync } = require("node:child_process");
const http = require("node:http");
const path = require("node:path");
const fs = require("node:fs");
const { createScreenRecorder, encodeScreen } = require("./screen-recorder.cjs");

// ───────────────────────────── Configuração ─────────────────────────────

const ROOT = path.resolve(__dirname, "..");
const FFMPEG =
  process.env.FFMPEG_PATH ||
  "C:\\Users\\Pedro\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.0.2-full_build\\bin\\ffmpeg.exe";
const FFPROBE = path.join(
  path.dirname(FFMPEG),
  process.platform === "win32" ? "ffprobe.exe" : "ffprobe",
);
const BASE = (process.env.DEMO_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const OUT_DIR = process.env.DEMO_OUT_DIR ? path.resolve(process.env.DEMO_OUT_DIR) : path.join(ROOT, "videos");
const RAW = path.join(OUT_DIR, "demo-raw.mkv");
const SHOTS_DIR = path.join(OUT_DIR, "shots");
const FINAL = path.join(OUT_DIR, "autosystem-demo.mp4");
const POSTER = path.join(OUT_DIR, "autosystem-demo-poster.jpg");

const W = 1920;
const H = 1080;
const FPS = 60;
const SHOTS = process.env.DEMO_SHOTS === "1";
const MUSIC = process.env.DEMO_MUSIC || "";
const CTA_URL = process.env.DEMO_URL || "autosystem.nulldev.com.br";
const CREDS = {
  email: process.env.DEMO_EMAIL || "demo@autosystem.dev",
  password: process.env.DEMO_PASSWORD || "Demo1234",
};

const TOTAL_CHAPTERS = 11;
let dryShot = async () => {};
const T = 1;
const ONLY = (process.env.DEMO_ONLY || "").split(",").filter(Boolean); // ex.: DEMO_ONLY=login,celular

fs.mkdirSync(OUT_DIR, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, Math.max(0, ms * T)));
const rnd = (a, b) => a + Math.random() * (b - a);
const log = (...a) => console.log("[demo]", ...a);

// ───────────────────────────── Servidor ─────────────────────────────

let serverProc = null;

function serverUp() {
  return new Promise((resolve) => {
    const req = http.get(BASE, (res) => {
      res.resume();
      resolve(res.statusCode < 500);
    });
    req.on("error", () => resolve(false));
    req.setTimeout(4000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function ensureServer() {
  if (await serverUp()) {
    log("Servidor já está rodando em", BASE);
    return;
  }
  let mode = "start";
  const hasBuild = fs.existsSync(path.join(ROOT, ".next", "BUILD_ID"));
  if (process.env.DEMO_SKIP_BUILD === "1" && hasBuild) {
    log("Reaproveitando o build existente.");
  } else {
    log("Gerando build de produção (garante que o vídeo mostre a interface atual)...");
    // tipos gerados pelo `next dev` podem ficar corrompidos e quebram o type-check do build
    fs.rmSync(path.join(ROOT, ".next", "dev"), { recursive: true, force: true });
    const b = spawnSync("npm run build", { cwd: ROOT, stdio: "inherit", shell: true });
    if (b.status !== 0) {
      log("Build falhou. Usando o modo de desenvolvimento.");
      mode = "dev";
    }
  }
  serverProc = spawn(mode === "start" ? "npm start" : "npm run dev", {
    cwd: ROOT,
    stdio: "ignore",
    shell: true,
    windowsHide: true,
  });
  for (let i = 0; i < 90; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    if (await serverUp()) {
      log("Servidor pronto (" + mode + ").");
      return;
    }
    if (serverProc.exitCode !== null) break;
  }
  throw new Error(
    "O servidor não respondeu em " + BASE + ". Se a porta estiver ocupada por outro processo, encerre-o e tente de novo.",
  );
}

function stopServer() {
  if (!serverProc) return;
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(serverProc.pid), "/T", "/F"], { stdio: "ignore" });
  } else {
    serverProc.kill("SIGTERM");
  }
  serverProc = null;
}

// ───────────────────────────── Camada visual (injetada no navegador) ─────────────────────────────

const overlayInit = (cfg) => {
  if (window.top !== window.self) {
    // Dentro do iframe do celular: encaminha o mouse ao cursor do documento principal.
    const fwd = (type) => (e) => {
      try {
        const r = window.frameElement.getBoundingClientRect();
        window.top.__demo.pointer(type, r.left + e.clientX, r.top + e.clientY);
      } catch {}
    };
    window.addEventListener("mousemove", fwd("move"), true);
    window.addEventListener("mousedown", fwd("down"), true);
    window.addEventListener("mouseup", fwd("up"), true);
    return;
  }
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

      /* cortina de transição */
      #d-cover{position:fixed;left:0;top:0;width:100vw;height:100vh;opacity:0;background:var(--background,#fff);transition:opacity .2s ease;z-index:10}

      /* cursor */
      #d-cur{position:fixed;left:-80px;top:-80px;width:34px;height:34px;z-index:100;transform:translate(-7px,-5px);transition:transform .12s ease;filter:drop-shadow(0 3px 5px rgba(0,0,0,.35))}
      #d-cur.down{transform:translate(-7px,-5px) scale(.88)}
      .d-rip{position:fixed;width:18px;height:18px;margin:-9px 0 0 -9px;border-radius:50%;border:3px solid #22c55e;background:rgba(34,197,94,.22);z-index:99;animation:d-rip .65s ease-out forwards}
      @keyframes d-rip{from{transform:scale(.4);opacity:1}to{transform:scale(3.4);opacity:0}}

      /* destaque */
      #d-spot{position:fixed;z-index:50;border:3px solid #facc15;border-radius:14px;box-shadow:0 0 0 6px rgba(250,204,21,.22),0 14px 40px rgba(0,0,0,.25);opacity:0;transform:scale(1.03);transition:opacity .3s ease,transform .35s cubic-bezier(.16,1,.3,1)}
      #d-spot.on{opacity:1;transform:scale(1)}
      #d-spot b{position:absolute;left:-3px;bottom:calc(100% + 10px);background:#facc15;color:#18181b;font-family:var(--fm);font-size:15px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:6px 12px;border-radius:6px;white-space:nowrap}

      /* legenda (terço inferior) */
      #d-cap{position:fixed;left:44px;bottom:48px;display:flex;align-items:stretch;z-index:60;opacity:0;transform:translateX(-30px);transition:opacity .4s ease,transform .5s cubic-bezier(.16,1,.3,1);filter:drop-shadow(0 16px 34px rgba(0,0,0,.38))}
      #d-cap.on{opacity:1;transform:none}
      #d-cap.r{left:auto;right:44px;transform:translateX(30px)}
      #d-cap.r.on{transform:none}
      #d-cap .n{background:#facc15;color:#18181b;font-family:var(--fi);font-weight:700;font-size:40px;padding:0 20px;display:flex;align-items:center;border-radius:14px 0 0 14px;letter-spacing:.03em}
      #d-cap .b{background:rgba(14,16,20,.94);padding:14px 26px 14px 20px;border-radius:0 14px 14px 0;max-width:640px}
      #d-cap .t{font-family:var(--fi);font-size:32px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;line-height:1.05;color:#fff}
      #d-cap .d{font-size:16px;font-weight:500;color:rgba(255,255,255,.74);margin-top:4px;line-height:1.35}

      /* barra de progresso */
      #d-prog{position:fixed;left:0;bottom:0;height:5px;width:0;z-index:70;background:linear-gradient(90deg,#facc15,#22c55e);transition:width 1s cubic-bezier(.16,1,.3,1)}

      /* marcador de sincronia */
      #d-flash{position:fixed;inset:0;background:#ff00ff;z-index:1000;display:none}

      /* abertura e encerramento */
      .d-card{position:fixed;inset:0;z-index:40;display:flex;align-items:center;justify-content:center;background:#0b0d10;opacity:0;visibility:hidden;transition:opacity .6s ease,visibility 0s linear .6s;overflow:hidden;color:#fff}
      .d-card.on{opacity:1;visibility:visible;transition:opacity .01s}
      .d-card .pegs{position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.09) 2px,transparent 2.5px);background-size:28px 28px;-webkit-mask-image:radial-gradient(ellipse at center,#000 25%,transparent 75%);mask-image:radial-gradient(ellipse at center,#000 25%,transparent 75%)}
      .d-card .hz{position:absolute;left:0;width:100%;height:24px;background:repeating-linear-gradient(-45deg,#facc15 0 18px,#18181b 18px 36px);opacity:0}
      .d-card .hz.t{top:0}.d-card .hz.b{bottom:0}
      .d-card.on .hz.t{animation:d-hzl 1.1s cubic-bezier(.16,1,.3,1) .05s forwards}
      .d-card.on .hz.b{animation:d-hzr 1.1s cubic-bezier(.16,1,.3,1) .05s forwards}
      @keyframes d-hzl{from{opacity:0;transform:translateX(-8%)}to{opacity:1;transform:none}}
      @keyframes d-hzr{from{opacity:0;transform:translateX(8%)}to{opacity:1;transform:none}}
      .d-card .c{position:relative;display:flex;flex-direction:column;align-items:center;gap:26px;text-align:center}
      .d-card .w{font-family:var(--fi);font-weight:700;font-size:168px;line-height:.9;letter-spacing:.04em;display:flex}
      .d-card .w i{font-style:normal;opacity:0}
      .d-card .w i.g{color:#22c55e}
      .d-card.on .w i{animation:d-up .7s cubic-bezier(.16,1,.3,1) forwards}
      @keyframes d-up{from{opacity:0;transform:translateY(34px)}to{opacity:1;transform:none}}
      .d-card .plate{font-family:var(--fm);font-weight:700;font-size:38px;letter-spacing:.16em;color:#111;background:#fff;border-top:11px solid #1e40af;padding:6px 26px 4px;border-radius:9px;opacity:0;box-shadow:0 12px 30px rgba(0,0,0,.4)}
      .d-card.on .plate{animation:d-pop .6s cubic-bezier(.16,1,.3,1) .5s forwards}
      @keyframes d-pop{from{opacity:0;transform:scale(.7) rotate(-6deg)}to{opacity:1;transform:scale(1) rotate(-2deg)}}
      .d-card .s{font-family:var(--fm);font-size:22px;letter-spacing:.32em;text-transform:uppercase;color:rgba(255,255,255,.62);opacity:0}
      .d-card.on .s{animation:d-up .7s ease 1.35s forwards}
      .d-card .chips{display:flex;gap:14px;opacity:0}
      .d-card.on .chips{animation:d-up .7s ease 1.2s forwards}
      .d-card .chip{background:#facc15;color:#18181b;font-family:var(--fm);font-weight:700;font-size:18px;letter-spacing:.1em;text-transform:uppercase;padding:9px 16px}
      .d-card .line{font-family:var(--fi);font-weight:700;font-size:58px;letter-spacing:.05em;text-transform:uppercase;line-height:1;max-width:1200px;text-wrap:balance;opacity:0}
      .d-card.on .line{animation:d-up .7s ease .9s forwards}
      .d-card .cta{display:flex;align-items:center;gap:22px;opacity:0}
      .d-card.on .cta{animation:d-up .7s ease 1.7s forwards}
      .d-card .btn{background:#22c55e;color:#06210f;font-weight:700;font-size:26px;padding:16px 30px;border-radius:12px}
      .d-card .url{font-family:var(--fm);font-size:26px;letter-spacing:.06em;color:rgba(255,255,255,.88)}

      /* cena do celular */
      #d-scene{position:fixed;inset:0;z-index:30;background:#0b0d10;opacity:0;visibility:hidden;transition:opacity .55s ease,visibility 0s linear .55s;overflow:hidden;color:#fff}
      #d-scene.on{opacity:1;visibility:visible;pointer-events:auto;transition:opacity .55s ease}
      #d-scene .pegs{position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.08) 2px,transparent 2.5px);background-size:28px 28px}
      #d-scene .hz{position:absolute;left:0;width:100%;height:22px;background:repeating-linear-gradient(-45deg,#facc15 0 18px,#18181b 18px 36px)}
      #d-scene .hz.t{top:0}#d-scene .hz.b{bottom:0}
      #d-scene .l{position:absolute;left:170px;top:50%;transform:translateY(-50%);max-width:760px}
      #d-scene .tape{display:inline-block;background:#facc15;color:#18181b;font-family:var(--fm);font-weight:700;font-size:20px;letter-spacing:.12em;text-transform:uppercase;padding:8px 16px}
      #d-scene h2{font-family:var(--fi);font-weight:700;font-size:122px;line-height:.95;letter-spacing:.03em;text-transform:uppercase;margin:26px 0 30px}
      #d-scene ul{list-style:none;padding:0;margin:0;display:grid;gap:14px;font-size:27px;color:rgba(255,255,255,.82)}
      #d-scene li{display:flex;gap:14px;align-items:center}
      #d-scene li:before{content:"";width:14px;height:14px;background:#22c55e;border-radius:3px;flex:none}
      #d-scene .phone{position:absolute;right:210px;top:50%;width:420px;height:874px;margin-top:-437px;border-radius:58px;background:#16181d;padding:15px;box-shadow:0 0 0 3px #2a2e35,0 40px 90px rgba(0,0,0,.6);transform:translateY(60px);opacity:0;transition:transform .8s cubic-bezier(.16,1,.3,1) .15s,opacity .6s ease .15s}
      #d-scene.on .phone{transform:none;opacity:1}
      #d-scene iframe{width:390px;height:844px;border:0;border-radius:44px;background:#fff;display:block}
    `;
    document.head.appendChild(style);

    host.innerHTML =
      '<div id="d-cover"></div>' +
      '<div id="d-scene"></div>' +
      '<div class="d-card" id="d-intro"></div>' +
      '<div class="d-card" id="d-outro"></div>' +
      '<div id="d-spot"></div>' +
      '<div id="d-cap"></div>' +
      '<div id="d-prog"></div>' +
      '<div id="d-flash"></div>' +
      '<svg id="d-cur" viewBox="0 0 24 24"><path d="M5 3l14 8-6.2 1.6L10.5 19z" fill="#fff" stroke="#111" stroke-width="1.4" stroke-linejoin="round"/></svg>';
    document.documentElement.appendChild(host);

    const $ = (id) => document.getElementById(id);
    const cover = $("d-cover");
    let capTimer = 0;

    // Evita a barrinha de URL do Chrome sobre links: tira o href enquanto o mouse está em cima e o
    // devolve ao sair. Os links do app são <Link> do Next, que navegam sem depender do atributo.
    const restore = (a) => {
      if (a && a.dataset.dh) {
        a.setAttribute("href", a.dataset.dh);
        delete a.dataset.dh;
      }
    };
    document.addEventListener("mouseover", (e) => {
      const a = e.target.closest && e.target.closest("a[href]");
      if (a) {
        a.dataset.dh = a.getAttribute("href");
        a.removeAttribute("href");
      }
    }, true);
    document.addEventListener("mouseout", (e) => {
      const a = e.target.closest && e.target.closest("a[data-dh]");
      if (a && !(e.relatedTarget && a.contains(e.relatedTarget))) restore(a);
    }, true);

    const cur = $("d-cur");
    const pointer = (type, x, y) => {
      cur.style.left = x + "px";
      cur.style.top = y + "px";
      if (type === "down") {
        cur.classList.add("down");
        const r = document.createElement("div");
        r.className = "d-rip";
        r.style.left = x + "px";
        r.style.top = y + "px";
        host.appendChild(r);
        setTimeout(() => r.remove(), 700);
      } else if (type === "up") {
        cur.classList.remove("down");
      }
    };
    window.addEventListener("mousemove", (e) => pointer("move", e.clientX, e.clientY), true);
    window.addEventListener("mousedown", (e) => pointer("down", e.clientX, e.clientY), true);
    window.addEventListener("mouseup", (e) => pointer("up", e.clientX, e.clientY), true);

    const wordmark = (el) => {
      const letters = "AUTOSYSTEM".split("");
      return letters.map((ch, i) =>
        '<i class="' + (i >= 4 ? "g" : "") + '" style="animation-delay:' + (200 + i * 55) + 'ms">' + ch + "</i>"
      ).join("");
    };

    window.__demo = {
      pointer,
      cover(on, o) {
        o = o || {};
        const ms = o.ms == null ? 200 : o.ms;
        if (on) {
          const r = o.rect;
          cover.style.left = r ? r.x + "px" : "0";
          cover.style.top = r ? r.y + "px" : "0";
          cover.style.width = r ? r.w + "px" : "100vw";
          cover.style.height = r ? r.h + "px" : "100vh";
          cover.style.background = o.color || "var(--background,#fff)";
          cover.style.transitionDuration = ms + "ms";
          cover.style.opacity = "1";
          if (!r) sessionStorage.setItem("demo:cover", o.color || "var(--background,#fff)");
        } else {
          cover.style.transitionDuration = ms + "ms";
          cover.style.opacity = "0";
          sessionStorage.removeItem("demo:cover");
        }
      },
      spot(rect, label) {
        const s = $("d-spot");
        const pad = 10;
        s.style.left = rect.x - pad + "px";
        s.style.top = rect.y - pad + "px";
        s.style.width = rect.w + pad * 2 + "px";
        s.style.height = rect.h + pad * 2 + "px";
        s.innerHTML = label ? "<b>" + label + "</b>" : "";
        s.classList.add("on");
      },
      unspot() {
        $("d-spot").classList.remove("on");
      },
      cap(n, title, desc, ms, right) {
        const c = $("d-cap");
        c.classList.toggle("r", !!right);
        c.innerHTML =
          '<div class="n">' + String(n).padStart(2, "0") + '</div><div class="b"><div class="t">' + title +
          '</div><div class="d">' + (desc || "") + "</div></div>";
        c.classList.add("on");
        clearTimeout(capTimer);
        capTimer = setTimeout(() => c.classList.remove("on"), ms || 5200);
      },
      capHide() {
        clearTimeout(capTimer);
        $("d-cap").classList.remove("on");
      },
      progress(p) {
        $("d-prog").style.width = Math.round(p * 100) + "%";
      },
      flash(on) {
        $("d-flash").style.display = on ? "block" : "none";
      },
      intro() {
        const el = $("d-intro");
        el.classList.remove("on");
        el.innerHTML =
          '<div class="pegs"></div><div class="hz t"></div><div class="hz b"></div>' +
          '<div class="c"><div class="w">' + wordmark() + '</div><div class="plate">KDF5M78</div>' +
          '<div class="s">Gestão para oficinas mecânicas</div></div>';
        void el.offsetWidth;
        el.classList.add("on");
      },
      introOut() {
        $("d-intro").classList.remove("on");
      },
      outro(cta, url) {
        const el = $("d-outro");
        el.classList.remove("on");
        el.innerHTML =
          '<div class="pegs"></div><div class="hz t"></div><div class="hz b"></div>' +
          '<div class="c"><div class="w">' + wordmark() + "</div>" +
          '<div class="line">Do orçamento à entrega, sem papel solto na bancada.</div>' +
          '<div class="chips"><span class="chip">Orçamentos</span><span class="chip">Ordens de serviço</span><span class="chip">Estoque</span><span class="chip">Financeiro</span></div>' +
          '<div class="cta"><span class="btn">' + cta + '</span><span class="url">' + url + "</span></div></div>";
        void el.offsetWidth;
        el.classList.add("on");
      },
      scene(on, html) {
        const s = $("d-scene");
        if (on) {
          s.innerHTML = html;
          void s.offsetWidth;
          s.classList.add("on");
        } else {
          s.classList.remove("on");
          setTimeout(() => { s.innerHTML = ""; }, 700);
        }
      },
      hideCursor(v) {
        cur.style.display = v ? "none" : "block";
      },
    };

    // Cortina persistente entre navegações completas (evita o "pisca" de carregamento).
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

let pointer = { x: W / 2, y: H / 2 };
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

async function glide(page, x, y, ms = 800) {
  const x0 = pointer.x;
  const y0 = pointer.y;
  const dx = x - x0;
  const dy = y - y0;
  const dist = Math.hypot(dx, dy);
  if (dist < 2) return;
  const bow = Math.min(70, dist * 0.09) * (Math.random() < 0.5 ? -1 : 1);
  const cx = (x0 + x) / 2 + (-dy / dist) * bow;
  const cy = (y0 + y) / 2 + (dx / dist) * bow;
  const steps = Math.max(10, Math.round((ms * T) / 16));
  const t0 = Date.now();
  for (let i = 1; i <= steps; i++) {
    const t = ease(i / steps);
    const u = 1 - t;
    await page.mouse.move(u * u * x0 + 2 * u * t * cx + t * t * x, u * u * y0 + 2 * u * t * cy + t * t * y);
    const wait = t0 + (i * ms * T) / steps - Date.now();
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  }
  pointer = { x, y };
}

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
    [Math.max(0, Math.round(y)), Math.max(60, ms * T)],
  );
}

async function scrollToSelector(page, selector, offset = 84, ms = 1300) {
  const y = await page.evaluate(
    ([sel, off]) => {
      const el = document.querySelector(sel);
      return el ? el.getBoundingClientRect().top + window.scrollY - off : 0;
    },
    [selector, offset],
  );
  await smoothScroll(page, y, ms);
}

async function reveal(page, loc, margin = 150) {
  const b = await loc.boundingBox().catch(() => null);
  if (!b) return;
  if (b.y < margin || b.y + b.height > H - margin) {
    const cur = await page.evaluate(() => window.scrollY);
    await smoothScroll(page, cur + b.y - H * 0.34, 800);
    await sleep(120);
  }
}

async function center(loc) {
  const b = await loc.boundingBox().catch(() => null);
  return b ? { x: b.x + b.width / 2, y: b.y + b.height / 2, b } : null;
}

async function hover(page, loc, { ms = 800, dx = 0, dy = 0 } = {}) {
  await reveal(page, loc);
  const c = await center(loc);
  if (!c) throw new Error("elemento sem posição");
  await glide(page, c.x + dx, c.y + dy, ms);
}

async function clickEl(page, loc, { ms = 800, pause = 240, dx = 0, dy = 0 } = {}) {
  await hover(page, loc, { ms, dx, dy });
  await sleep(pause);
  await page.mouse.down();
  await sleep(80);
  await page.mouse.up();
}

async function typeText(page, text, { min = 45, max = 100 } = {}) {
  for (const ch of text) {
    await page.keyboard.type(ch);
    await sleep(rnd(min, max));
  }
}

async function spotEl(page, loc, label, { hold = 2200 } = {}) {
  const b = await loc.boundingBox().catch(() => null);
  if (!b) return;
  await page.evaluate(([r, l]) => window.__demo.spot(r, l), [{ x: b.x, y: b.y, w: b.width, h: b.height }, label]);
  await sleep(hold * 0.6);
  await dryShot("destaque-" + String(label).replace(/W+/g, "-").toLowerCase());
  await sleep(hold * 0.4);
  await page.evaluate(() => window.__demo.unspot());
  await sleep(250);
}

const cap = (page, n, title, desc, ms, right = false) =>
  page.evaluate(([a, b, c, d, r]) => window.__demo.cap(a, b, c, d, r), [n, title, desc, ms, right]);
const progress = (page, n) => page.evaluate((p) => window.__demo.progress(p), n / TOTAL_CHAPTERS);

// ───────────────────────────── Carregamento, cortes e transições ─────────────────────────────

let rec = null; // gravador (pausado enquanto a tela está coberta)

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

async function mainRect(page) {
  return page.evaluate(() => {
    const m = document.querySelector("main");
    const h = document.querySelector("header");
    if (!m) return null;
    const r = m.getBoundingClientRect();
    const top = h ? h.getBoundingClientRect().bottom : 0;
    return { x: r.left, y: top, w: r.width, h: window.innerHeight - top };
  });
}

/**
 * Clica num alvo que troca de tela.
 *  1. o cursor vai até o alvo com a tela totalmente visível;
 *  2. ao apertar o botão (clique animado) a cortina começa a fechar;
 *  3. o clique é solto com a cortina já fechada, então o carregamento nunca aparece;
 *  4. a espera é cortada na edição e a cortina abre revelando a nova tela.
 * full=true cobre a tela toda (navegação completa); senão cobre só a área de conteúdo.
 */
async function clickTransition(page, loc, { full = false, color, url, ready, glideMs = 800, pause = 240 } = {}) {
  await hover(page, loc, { ms: glideMs });
  await sleep(pause);
  const rect = full ? null : await mainRect(page);
  await page.mouse.down();
  await page.evaluate(([r, c]) => window.__demo.cover(true, { rect: r, color: c, ms: 130 }), [rect, color || null]);
  await sleep(180);
  rec.pause(); // tela coberta: a espera de carregamento não entra no vídeo
  await page.mouse.up();
  if (url) await page.waitForURL(url, { timeout: 30000 }).catch(() => {});
  // a URL muda antes de a tela nova existir: espera um elemento próprio do destino
  if (ready) await page.waitForSelector(ready, { timeout: 30000 }).catch(() => {});
  await settle(page, 400);
  rec.resume();
  await page.evaluate(() => window.__demo.cover(false, { ms: 260 }));
  await sleep(300);
}

const sidebarLink = (page, href) => page.locator(`a[href="${href}"]`).first();

async function goSidebar(page, href) {
  await clickTransition(page, sidebarLink(page, href), {
    glideMs: 760,
    pause: 200,
    url: (u) => u.pathname === href,
  });
}

// ───────────────────────────── Descoberta e aquecimento ─────────────────────────────

async function login(page) {
  await page.goto(BASE + "/auth", { waitUntil: "domcontentloaded" });
  await page.getByLabel("E-mail", { exact: true }).fill(CREDS.email);
  await page.getByLabel("Senha", { exact: true }).fill(CREDS.password);
  await page.getByRole("button", { name: /^entrar$/i }).click();
  await page.waitForURL("**/dashboard", { timeout: 60000 });
}

async function discover(ids) {
  log("Aquecendo rotas e descobrindo dados...");
  const b = await chromium.launch({ channel: "chrome", headless: true });
  try {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, locale: "pt-BR" });
    const page = await ctx.newPage();
    page.setDefaultTimeout(30000);
    await login(page);

    const visit = async (url) => {
      await page.goto(BASE + url, { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
    };

    await visit("/dashboard/budget");
    ids.budget = await page
      .locator("main li", { hasText: "Pendente" })
      .locator('a[href^="/dashboard/budget/"]')
      .first()
      .getAttribute("href")
      .catch(() => null);
    await visit("/dashboard/service");
    ids.service = await page
      .locator("main li", { hasText: "Em andamento" })
      .locator('a[href^="/dashboard/service/"]')
      .first()
      .getAttribute("href")
      .catch(() => null);

    const routes = [
      "/dashboard",
      "/dashboard/customer",
      "/dashboard/vehicle",
      "/dashboard/product",
      "/dashboard/financeiro",
      "/dashboard/relatorios",
      ids.budget,
      ids.service,
    ].filter(Boolean);
    for (let pass = 0; pass < 2; pass++) for (const r of routes) await visit(r);
    if (ids.budget) {
      await visit("/budget/sign/" + ids.budget.split("/").pop());
    }
    await visit("/");
    await visit("/auth").catch(() => {});
    await ctx.close();
  } finally {
    await b.close().catch(() => {});
  }
  log("Dados:", JSON.stringify(ids));
}

// ───────────────────────────── Cena do celular ─────────────────────────────

function phoneSceneHtml(signUrl) {
  return (
    '<div class="pegs"></div><div class="hz t"></div><div class="hz b"></div>' +
    '<div class="l"><span class="tape">Do outro lado do balcão</span>' +
    "<h2>O cliente assina<br>no celular.</h2>" +
    "<ul><li>Recebe o link pelo WhatsApp</li><li>Confere os itens e o valor</li><li>Assina com o dedo, sem imprimir nada</li></ul></div>" +
    '<div class="phone"><iframe src="' + signUrl + '"></iframe></div>'
  );
}

async function signatureScene(page, budgetPath) {
  const id = budgetPath.split("/").pop();
  await page.evaluate(([html]) => window.__demo.scene(true, html), [phoneSceneHtml("/budget/sign/" + id)]);
  await sleep(1500);
  let frame = null;
  for (let i = 0; i < 40 && !frame; i++) {
    frame = page.frames().find((f) => f.url().includes("/budget/sign/")) || null;
    if (!frame) await sleep(250);
  }
  if (!frame) throw new Error("iframe do celular não carregou");
  await frame.waitForLoadState("domcontentloaded").catch(() => {});
  await frame.waitForSelector("canvas", { timeout: 15000 });
  await sleep(1400);

  // mostra o topo da página (cliente, veículo, itens) e rola até a assinatura
  await frame.evaluate(() => window.scrollTo({ top: 420, behavior: "smooth" }));
  await sleep(1800);

  const canvas = frame.locator("canvas").first();
  const box = await canvas.boundingBox();
  log("canvas:", JSON.stringify(box));
  if (box) {
    const sx = box.x + box.width * 0.14;
    const sy = box.y + box.height * 0.58;
    await glide(page, sx, sy, 900);
    await sleep(250);
    await page.mouse.down();
    const pts = [];
    for (let i = 0; i <= 56; i++) {
      const t = i / 56;
      pts.push([
        sx + t * box.width * 0.7,
        sy + Math.sin(t * Math.PI * 4.2) * box.height * 0.2 * (1 - t * 0.35) - Math.sin(t * Math.PI) * 14,
      ]);
    }
    for (const [px, py] of pts) {
      await page.mouse.move(px, py);
      await sleep(15);
    }
    await page.mouse.up();
    pointer = { x: pts[pts.length - 1][0], y: pts[pts.length - 1][1] };
  }
  await sleep(700);
  await dryShot("celular-assinado");

  await frame.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }));
  await sleep(1200);
  const btn = frame.getByRole("button", { name: /confirmar e aprovar/i });
  if (await btn.count()) {
    const b = await btn.boundingBox();
    if (b) {
      await glide(page, b.x + b.width / 2, b.y + b.height / 2, 800);
      await page.evaluate(
        ([r]) => window.__demo.spot(r, "Aprovação em um toque"),
        [{ x: b.x, y: b.y, w: b.width, h: b.height }],
      );
      await sleep(1200);
      await dryShot("celular-confirmar");
      await sleep(1100);
      await page.evaluate(() => window.__demo.unspot());
    }
  }
  await sleep(300);
  await page.evaluate(() => window.__demo.scene(false));
  await sleep(750);
}

// ───────────────────────────── Edição final ─────────────────────────────

function runFF(args, opts = {}) {
  return spawnSync(FFMPEG, args, { stdio: ["ignore", "pipe", "pipe"], maxBuffer: 200 * 1024 * 1024, ...opts });
}

function minimizeWindows(minimize) {
  const method = minimize ? "MinimizeAll" : "UndoMinimizeALL";
  spawnSync("powershell", ["-NoProfile", "-Command", `(New-Object -ComObject Shell.Application).${method}()`], {
    stdio: "ignore",
  });
}

function probeDuration(file) {
  const r = spawnSync(FFPROBE, ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", file], {
    encoding: "utf8",
  });
  return parseFloat(r.stdout) || 0;
}

function encode() {
  const r = encodeScreen({
    rec,
    raw: RAW,
    out: FINAL,
    width: W,
    height: H,
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
  await ensureServer();
  await discover(ids);

  if (SHOTS) fs.mkdirSync(SHOTS_DIR, { recursive: true });

  // Chrome visível em tela cheia: o ffmpeg grava a tela inteira a 60 fps.
  // Durante a gravação a tela fica ocupada: não use o mouse nem o teclado.
  // O Windows não deixa um programa de fundo passar à frente das outras janelas, então elas são
  // minimizadas antes e restauradas no fim.
  minimizeWindows(true);
  await new Promise((r) => setTimeout(r, 1200));
  const browser = await chromium.launch({
    channel: "chrome",
    headless: false,
    ignoreDefaultArgs: ["--enable-automation"],
    args: [
      "--window-position=0,0",
      `--window-size=${W},${H}`,
      "--force-device-scale-factor=1",
      "--hide-scrollbars",
      "--disable-infobars",
      "--no-first-run",
      "--autoplay-policy=no-user-gesture-required",
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
    await context.addInitScript(overlayInit, {});
    // O iframe do celular precisa de permissão de moldura: remove CSP/X-Frame-Options só nesta sessão.
    await context.route("**/*", async (route) => {
      if (route.request().resourceType() !== "document") return route.continue();
      try {
        const res = await route.fetch();
        const headers = { ...res.headers() };
        delete headers["content-security-policy"];
        delete headers["x-frame-options"];
        await route.fulfill({ response: res, headers });
      } catch {
        await route.continue().catch(() => {});
      }
    });

    const page = await context.newPage();
    page.setDefaultTimeout(25000);
    const cdp = await context.newCDPSession(page);
    const { windowId } = await cdp.send("Browser.getWindowForTarget");
    await cdp.send("Browser.setWindowBounds", { windowId, bounds: { windowState: "fullscreen" } });
    await page.bringToFront();
    await new Promise((r) => setTimeout(r, 5000)); // o aviso "tela cheia" do Chrome some sozinho
    rec = createScreenRecorder({ ffmpeg: FFMPEG, ffprobe: FFPROBE, region: { x: 0, y: 0, width: W, height: H }, raw: RAW, fps: FPS });

    await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    await settle(page, 600);
    const vp = await page.evaluate(() => ({ w: innerWidth, h: innerHeight, dpr: devicePixelRatio }));
    log("Janela:", JSON.stringify(vp), "→ saída", W + "x" + H);
    await page.mouse.move(pointer.x, pointer.y);

    const shot = async (name) => {
      if (SHOTS) await page.screenshot({ path: path.join(SHOTS_DIR, name + ".png") });
    };
    dryShot = shot;

    await rec.start();
    recording = true;
    await sleep(500);

    const scene = async (name, fn) => {
      if (ONLY.length && name !== "abertura" && !ONLY.includes(name)) return;
      log("cena:", name);
      try {
        await fn();
      } catch (e) {
        log(`erro na cena "${name}":`, e.message.split("\n")[0]);
        rec.resume();
        await page.evaluate(() => {
          window.__demo.unspot();
          window.__demo.scene(false);
          window.__demo.cover(false, { ms: 150 });
        }).catch(() => {});
      }
      await shot("cena-" + name.replace(/\W+/g, "-"));
    };

    // ── Abertura ──
    await scene("abertura", async () => {
      await page.evaluate(() => window.__demo.intro());
      await sleep(2900);
      await shot("abertura-meio");
      await sleep(1000);
      await page.evaluate(() => window.__demo.introOut());
      await sleep(600);
      // recarrega sob a cortina escura para a landing entrar com as suas animações
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
      await cap(page, 1, "Conheça o AutoSystem", "Do orçamento à entrega, sem papel solto na bancada.");
      await sleep(1400);
      await shot("landing-legenda");
      const sheet = page.locator('[role="img"]').first();
      await glide(page, 1180, 520, 1100);
      await spotEl(page, sheet, "Ordem de serviço digital", { hold: 2400 });

      await scrollToSelector(page, "#caminho", 84, 1500);
      await sleep(900);
      const stations = page.locator("#caminho ol li");
      const n = await stations.count();
      for (let i = 0; i < n; i++) {
        await hover(page, stations.nth(i), { ms: 620, dy: 30 });
        await sleep(550);
      }
      await sleep(500);
      await scrollToSelector(page, "#bancada", 84, 1500);
      await sleep(2300);
      await smoothScroll(page, 0, 1500);
      await sleep(700);
    });

    // ── 2. Login ──
    await scene("login", async () => {
      await progress(page, 2);
      await clickTransition(page, page.locator('header a[href="/auth"]').first(), {
        full: true,
        url: "**/auth",
        ready: 'input[type="email"]',
        pause: 220,
      });
      await cap(page, 2, "Acesso seguro", "Entre com e-mail e senha ou crie a conta em segundos.", 5200, true);
      await sleep(1300);
      await clickEl(page, page.getByRole("tab", { name: "Criar conta" }), { ms: 800 });
      await sleep(1700);
      await clickEl(page, page.getByRole("tab", { name: "Entrar" }), { ms: 700 });
      await sleep(900);
      await clickEl(page, page.getByLabel("E-mail", { exact: true }), { ms: 750 });
      await typeText(page, CREDS.email);
      await sleep(250);
      await clickEl(page, page.getByLabel("Senha", { exact: true }), { ms: 600 });
      await typeText(page, CREDS.password, { min: 60, max: 120 });
      await sleep(400);
      await shot("login-preenchido");
      await clickTransition(page, page.getByRole("button", { name: /^entrar$/i }), {
        full: true,
        url: "**/dashboard",
        ready: 'a[href="/dashboard/budget"]',
        glideMs: 650,
        pause: 220,
      });
    });

    // ── 3. Dashboard ──
    await scene("dashboard", async () => {
      await progress(page, 3);
      await cap(page, 3, "Visão geral", "Orçamentos, clientes e faturamento num só painel.");
      await sleep(1100);
      const cards = page.locator('section[aria-label="Indicadores"] > div');
      const n = await cards.count();
      for (let i = 0; i < n; i++) {
        await hover(page, cards.nth(i), { ms: 640, dy: 18 });
        await sleep(420);
      }
      const row = page.locator('a[href^="/dashboard/budget/"]').first();
      if (await row.count()) {
        await hover(page, row, { ms: 800 });
        await spotEl(page, page.locator("ul.divide-y").first(), "Aguardando aprovação", { hold: 2300 });
      }
      await sleep(500);
    });

    // ── 4. Orçamentos ──
    await scene("orcamentos", async () => {
      await progress(page, 4);
      await goSidebar(page, "/dashboard/budget");
      await cap(page, 4, "Orçamentos", "Monte, envie pelo WhatsApp e acompanhe a aprovação.");
      await sleep(1300);
      const search = page.getByRole("searchbox").first();
      await clickEl(page, search, { ms: 800 });
      await typeText(page, "Luciana");
      await sleep(1100);
      await page.keyboard.press("Control+A");
      await page.keyboard.press("Backspace");
      await sleep(500);
      await clickEl(page, page.getByRole("tab", { name: /Pendentes/ }), { ms: 750 });
      await sleep(1100);
      await clickEl(page, page.getByRole("tab", { name: /Todos/ }), { ms: 600 });
      await sleep(500);
      if (ids.budget) {
        const link = page.locator(`a[href="${ids.budget}"]`).first();
        await clickTransition(page, link, { url: "**" + ids.budget, pause: 260 });
        await sleep(600);
        await spotEl(page, page.locator("section", { hasText: "Itens e peças" }).last(), "Itens, peças e total", { hold: 2200 });
        await hover(page, page.getByRole("button", { name: /Enviar ao cliente/ }), { ms: 800 });
        await sleep(900);
      }
    });

    // ── 5. Cliente assina no celular ──
    await scene("celular", async () => {
      await progress(page, 5);
      if (!ids.budget) return;
      await cap(page, 5, "Assinatura no celular", "O cliente aprova pelo link, sem imprimir nada.", 6500);
      await signatureScene(page, ids.budget);
    });

    // ── 6. Ordens de serviço ──
    await scene("ordens", async () => {
      await progress(page, 6);
      await goSidebar(page, "/dashboard/service");
      await cap(page, 6, "Ordens de serviço", "Cada orçamento aprovado vira uma O.S. acompanhada até a entrega.");
      await sleep(1400);
      await clickEl(page, page.getByRole("tab", { name: /Em andamento/ }), { ms: 800 });
      await sleep(1200);
      await clickEl(page, page.getByRole("tab", { name: /Todas/ }), { ms: 600 });
      await sleep(500);
      if (ids.service) {
        const link = page.locator(`a[href="${ids.service}"]`).first();
        await clickTransition(page, link, { url: "**" + ids.service, pause: 260 });
        await sleep(600);
        const fin = page.getByRole("button", { name: /Finalizar O\.S\./ });
        if (await fin.count()) {
          await hover(page, fin, { ms: 900 });
          await spotEl(page, fin, "Finaliza e lança no financeiro", { hold: 2300 });
        }
      }
    });

    // ── 7. Clientes e veículos ──
    await scene("clientes-veiculos", async () => {
      await progress(page, 7);
      await goSidebar(page, "/dashboard/customer");
      await cap(page, 7, "Clientes e veículos", "Cada carro ligado ao dono, com placa no padrão Mercosul.");
      await sleep(1100);
      const cards = page.locator("main ul li");
      for (let i = 0; i < Math.min(3, await cards.count()); i++) {
        await hover(page, cards.nth(i), { ms: 620, dy: 20 });
        await sleep(380);
      }
      await goSidebar(page, "/dashboard/vehicle");
      await sleep(900);
      const search = page.getByRole("searchbox").first();
      await clickEl(page, search, { ms: 800 });
      await typeText(page, "Onix");
      await sleep(1300);
      await page.keyboard.press("Control+A");
      await page.keyboard.press("Backspace");
      await sleep(700);
    });

    // ── 8. Estoque ──
    await scene("estoque", async () => {
      await progress(page, 8);
      await goSidebar(page, "/dashboard/product");
      await cap(page, 8, "Estoque com alerta", "Veja o que está baixo ou esgotado antes de faltar peça.");
      await sleep(1300);
      await clickEl(page, page.getByRole("tab", { name: /Baixo/ }), { ms: 800 });
      await sleep(1300);
      const adjust = page.getByRole("button", { name: /Ajustar estoque/ }).first();
      await clickEl(page, adjust, { ms: 850 });
      await sleep(900);
      const qty = page.getByRole("dialog").locator('input[type="number"]').first();
      if (await qty.count()) {
        await clickEl(page, qty, { ms: 650 });
        await page.keyboard.press("Control+A");
        await typeText(page, "10", { min: 80, max: 140 });
      }
      await sleep(900);
      await shot("estoque-modal");
      await sleep(600);
      await page.keyboard.press("Escape");
      await sleep(600);
      await clickEl(page, page.getByRole("tab", { name: /Todos/ }), { ms: 700 });
      await sleep(400);
    });

    // ── 9. Financeiro ──
    await scene("financeiro", async () => {
      await progress(page, 9);
      await goSidebar(page, "/dashboard/financeiro");
      await cap(page, 9, "Financeiro", "Receitas, despesas e lucro real, com recibo em PDF.");
      await sleep(1500);
      await clickEl(page, page.getByRole("tab", { name: /Entradas/ }), { ms: 800 });
      await sleep(1300);
      await clickEl(page, page.getByRole("tab", { name: /Saídas/ }), { ms: 600 });
      await sleep(1300);
      await clickEl(page, page.getByRole("tab", { name: /Todas/ }), { ms: 600 });
      await sleep(600);
    });

    // ── 10. Relatórios ──
    await scene("relatorios", async () => {
      await progress(page, 10);
      await goSidebar(page, "/dashboard/relatorios");
      await cap(page, 10, "Relatórios", "Faturamento por período, categoria e meio de pagamento.");
      await sleep(1500);
      const bars = page.locator("main div.group:has(div.rounded-t-md)");
      const n = await bars.count();
      for (let i = 0; i < n; i++) {
        await hover(page, bars.nth(i).locator("div.rounded-t-md").first(), { ms: 560 });
        await sleep(650);
        if (i === 1) await shot("relatorios-tooltip");
      }
      await sleep(600);
    });

    // ── 11. Tema ──
    await scene("tema", async () => {
      await progress(page, 11);
      await goSidebar(page, "/dashboard");
      await cap(page, 11, "Tema claro e escuro", "Escolha o visual que cansa menos a vista na oficina.");
      await sleep(1300);
      const toggle = page.locator('button[aria-label="Usar tema escuro"]');
      await clickEl(page, toggle, { ms: 900 });
      await sleep(2700);
      await shot("tema-escuro");
    });

    // ── Encerramento ──
    await scene("encerramento", async () => {
      await page.evaluate(() => {
        window.__demo.capHide();
        window.__demo.hideCursor(true);
      });
      await progress(page, TOTAL_CHAPTERS);
      await sleep(500);
      await page.evaluate(([c, u]) => window.__demo.outro(c, u), ["Teste grátis por 14 dias", CTA_URL]);
      await sleep(5200);
      await shot("outro");
      await page.evaluate(() => window.__demo.cover(true, { color: "#0b0d10", ms: 900 }));
      await sleep(1100);
    });
  } catch (err) {
    console.error("ERRO NO DEMO:", err.message);
    process.exitCode = 1;
  } finally {
    if (recording) await rec.stop();
    await browser.close().catch(() => {});
    minimizeWindows(false);
    stopServer();
    await new Promise((r) => setTimeout(r, 400));
    if (recording) encode();
  }
}

if (require.main === module) {
  run().catch((e) => {
    console.error(e);
    stopServer();
    process.exit(1);
  });
}

module.exports = {
  ensureServer,
  stopServer,
  discover,
  runFF,
  probeDuration,
  FFMPEG,
  FFPROBE,
  BASE,
  CREDS,
  CTA_URL,
  OUT_DIR,
  MUSIC,
};
