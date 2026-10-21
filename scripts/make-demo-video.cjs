const { chromium } = require("playwright-core");
const { spawn, spawnSync } = require("node:child_process");
const http = require("node:http");
const path = require("node:path");
const fs = require("node:fs");

const FFMPEG = process.env.FFMPEG_PATH || "C:\\Users\\Pedro\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.0.2-full_build\\bin\\ffmpeg.exe";
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "videos");
const RAW = path.join(OUT_DIR, "demo-raw.mp4");
const FINAL = path.join(OUT_DIR, "autosystem-demo.mp4");
const BASE = "http://localhost:3000";

fs.mkdirSync(OUT_DIR, { recursive: true });
if (fs.existsSync(RAW)) fs.unlinkSync(RAW);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
  if (await serverUp()) return;
  console.log("Servidor offline. Iniciando npm start...");
  serverProc = spawn(
    process.platform === "win32" ? "npm.cmd" : "npm",
    ["start"],
    { cwd: ROOT, stdio: "ignore", windowsHide: true },
  );
  for (let i = 0; i < 45; i++) {
    await sleep(1000);
    if (await serverUp()) {
      console.log("Servidor pronto.");
      return;
    }
    if (serverProc.exitCode !== null) break;
  }
  throw new Error(
    "Servidor não respondeu em " +
      BASE +
      ". Rode `npm run build` e `npm start` manualmente e tente de novo.",
  );
}

function stopServer() {
  if (!serverProc) return;
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(serverProc.pid), "/T", "/F"], {
      stdio: "ignore",
    });
  } else {
    serverProc.kill("SIGTERM");
  }
  serverProc = null;
}

const initScript = () => {
  const ensure = () => {
    if (document.getElementById("demo-cursor")) return;
    const style = document.createElement("style");
    style.textContent = `
      nextjs-portal{display:none !important}
      #demo-cursor{position:fixed;width:20px;height:20px;border-radius:50%;background:rgba(34,197,94,.30);border:2px solid #22c55e;box-shadow:0 0 14px rgba(34,197,94,.85);z-index:2147483647;pointer-events:none;transform:translate(-50%,-50%) scale(1);transition:transform .06s linear,left .06s linear,top .06s linear;left:-60px;top:-60px}
      #demo-cursor.click{transform:translate(-50%,-50%) scale(.6)}
      #demo-caption{position:fixed;left:50%;bottom:38px;transform:translateX(-50%) translateY(18px);background:rgba(9,9,9,.86);border:1px solid rgba(34,197,94,.5);color:#fff;font-family:system-ui,-apple-system,sans-serif;font-weight:800;letter-spacing:.10em;text-transform:uppercase;font-size:15px;padding:13px 30px;border-radius:999px;z-index:2147483646;pointer-events:none;opacity:0;transition:opacity .35s ease,transform .35s ease;backdrop-filter:blur(8px);box-shadow:0 10px 40px rgba(0,0,0,.55)}
      #demo-caption.show{opacity:1;transform:translateX(-50%) translateY(0)}
      #demo-intro{position:fixed;inset:0;background:#0a0a0a;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;z-index:2147483645;pointer-events:none;opacity:1;transition:opacity .6s ease;font-family:system-ui,-apple-system,sans-serif}
      #demo-intro.hide{opacity:0}
      #demo-intro .t{color:#fff;font-size:58px;font-weight:900;letter-spacing:-.03em;font-style:italic}
      #demo-intro .t span{color:#22c55e}
      #demo-intro .s{color:#9ca3af;font-size:17px;letter-spacing:.22em;text-transform:uppercase}
      #demo-fade{position:fixed;inset:0;background:#000;z-index:2147483644;pointer-events:none;opacity:0;transition:opacity .7s ease}
      #demo-fade.on{opacity:1}
      #demo-outro{position:fixed;inset:0;z-index:2147483645;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;background-color:#080808;background-image:radial-gradient(circle at 50% 42%,rgba(34,197,94,.20) 0%,rgba(10,10,10,.96) 42%,#080808 72%);opacity:0;visibility:hidden;transition:opacity .55s ease;font-family:system-ui,-apple-system,sans-serif;overflow:hidden}
      #demo-outro.show{opacity:1;visibility:visible}
      #demo-outro .glow{position:absolute;width:680px;height:680px;border-radius:50%;background:radial-gradient(circle,rgba(34,197,94,.25),transparent 65%);filter:blur(40px);animation:demoPulse 3.2s ease-in-out infinite}
      #demo-outro .wrap{position:relative;display:flex;flex-direction:column;align-items:center;gap:16px;opacity:0;transform:translateY(16px) scale(.96);transition:opacity .6s ease .15s,transform .7s cubic-bezier(.16,1,.3,1) .15s}
      #demo-outro.show .wrap{opacity:1;transform:translateY(0) scale(1)}
      #demo-outro .brand{font-size:76px;font-weight:900;font-style:italic;letter-spacing:-.045em;color:#fff;line-height:1}
      #demo-outro .brand span{color:#22c55e;text-shadow:0 0 34px rgba(34,197,94,.55)}
      #demo-outro .tag{color:#9ca3af;font-size:14px;font-weight:700;letter-spacing:.34em;text-transform:uppercase}
      #demo-outro .line{width:0;height:3px;border-radius:99px;background:linear-gradient(90deg,rgba(34,197,94,0),#22c55e,rgba(34,197,94,0));transition:width 1.1s ease .55s}
      #demo-outro.show .line{width:300px}
      #demo-outro .chips{display:flex;gap:10px;margin-top:10px;opacity:0;transform:translateY(10px);transition:opacity .5s ease 1s,transform .5s ease 1s}
      #demo-outro.show .chips{opacity:1;transform:translateY(0)}
      #demo-outro .chip{color:rgba(255,255,255,.55);border:1px solid rgba(34,197,94,.28);background:rgba(34,197,94,.06);font-size:10px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;padding:7px 14px;border-radius:999px}
      @keyframes demoPulse{0%,100%{transform:scale(1);opacity:.85}50%{transform:scale(1.12);opacity:1}}
      #demo-caption{font-size:19px;padding:15px 34px}
    `;
    document.documentElement.appendChild(style);
    const cur = document.createElement("div");
    cur.id = "demo-cursor";
    const cap = document.createElement("div");
    cap.id = "demo-caption";
    const fade = document.createElement("div");
    fade.id = "demo-fade";
    const outro = document.createElement("div");
    outro.id = "demo-outro";
    outro.innerHTML =
      '<div class="glow"></div><div class="wrap"><div class="brand">AUTO<span>SYSTEM</span></div><div class="line"></div><div class="tag">Gestão completa para oficinas</div><div class="chips"><div class="chip">Orçamentos</div><div class="chip">Ordens de Serviço</div><div class="chip">Financeiro</div><div class="chip">Estoque</div></div></div>';
    document.documentElement.append(cur, cap, fade, outro);
    if (location.pathname === "/") {
      const intro = document.createElement("div");
      intro.id = "demo-intro";
      intro.innerHTML =
        '<div class="t">AUTO<span>SYSTEM</span></div><div class="s">gestão completa para oficinas</div>';
      document.documentElement.appendChild(intro);
    }
    window.addEventListener(
      "mousemove",
      (e) => {
        cur.style.left = e.clientX + "px";
        cur.style.top = e.clientY + "px";
      },
      true,
    );
    window.addEventListener("mousedown", () => cur.classList.add("click"), true);
    window.addEventListener("mouseup", () => cur.classList.remove("click"), true);
  };
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", ensure);
  else ensure();
};

async function caption(page, text) {
  await page.evaluate((t) => {
    const c = document.getElementById("demo-caption");
    if (!c) return;
    c.textContent = t;
    c.classList.add("show");
  }, text);
}

async function moveToEl(page, locator) {
  const box = await locator.boundingBox().catch(() => null);
  if (!box) return;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
    steps: 18,
  });
}

async function smoothScroll(page, targetY, duration = 650) {
  await page.evaluate(
    ([y, d]) => {
      const start = window.scrollY;
      const t0 = performance.now();
      return new Promise((resolve) => {
        function step(now) {
          const p = Math.min(1, (now - t0) / d);
          const e = 1 - Math.pow(1 - p, 3);
          window.scrollTo(0, start + (y - start) * e);
          if (p < 1) requestAnimationFrame(step);
          else resolve();
        }
        requestAnimationFrame(step);
      });
    },
    [targetY, duration],
  );
}

async function settle(page, wait = 700) {
  await page
    .waitForFunction(
      () => !!document.querySelector('main [data-slot="skeleton"]'),
      null,
      { timeout: 900 },
    )
    .catch(() => {});
  await page
    .waitForFunction(
      () => {
        const main = document.querySelector("main");
        if (!main) return false;
        return (
          main.querySelectorAll('[data-slot="skeleton"]').length === 0 &&
          main.innerText.trim().length > 30
        );
      },
      null,
      { timeout: 10000 },
    )
    .catch(() => {});
  await sleep(wait);
}

async function mainText(page) {
  return page.evaluate(
    () => document.querySelector("main")?.innerText.slice(0, 160) ?? "",
  );
}

async function waitContentChange(page, prev) {
  await page
    .waitForFunction(
      (p) => {
        const main = document.querySelector("main");
        if (!main) return false;
        return main.innerText.slice(0, 160) !== p;
      },
      prev,
      { timeout: 20000 },
    )
    .catch(() => {});
}

async function clickSidebar(page, name, cap) {
  const link = page.getByRole("link", { name, exact: false }).first();
  const href = await link.getAttribute("href");
  await moveToEl(page, link);
  await sleep(160);
  const prev = await mainText(page);
  const tClick = Date.now();
  await link.click();
  if (cap) await caption(page, cap);
  if (href) {
    const esc = href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    await page.waitForURL(new RegExp(esc), { timeout: 20000 }).catch(() => {});
  }
  await waitContentChange(page, prev);
  await settle(page, 700);
  addGap(tClick, Date.now(), 700);
}

function stopFF() {
  return new Promise((resolve) => {
    if (!ff) return resolve();
    const proc = ff;
    ff = null;
    const done = () => resolve();
    proc.once("close", done);
    try {
      proc.stdin.write("q");
      proc.stdin.end();
    } catch {
      proc.kill();
    }
    setTimeout(() => {
      try {
        proc.kill();
      } catch {}
      resolve();
    }, 8000);
  });
}


let ff = null;
let REC_START = 0;
let gaps = [];

function addGap(startWall, endWall, trailingMs) {
  const a = (startWall - REC_START) / 1000 + 0.35;
  const b = (endWall - REC_START) / 1000 - trailingMs / 1000 + 0.9;
  if (b - a > 0.6) gaps.push([a, b]);
}

function cutFilter() {
  const merged = [];
  for (const g of gaps.sort((x, y) => x[0] - y[0])) {
    const last = merged[merged.length - 1];
    if (last && g[0] <= last[1] + 0.02) last[1] = Math.max(last[1], g[1]);
    else merged.push([...g]);
  }
  const cond = merged
    .map(([a, b]) => `not(between(t\\,${a.toFixed(2)}\\,${b.toFixed(2)}))`)
    .join("*");
  console.log("gaps:", JSON.stringify(merged.map((g) => g.map((v) => +v.toFixed(2)))));
  return cond ? `select='${cond}',setpts=N/60/TB` : null;
}

(async () => {
  let browser;
  try {
    await ensureServer();
    browser = await chromium.launch({
      channel: "chrome",
      headless: false,
      args: [
        "--start-maximized",
        "--window-size=1920,1080",
        "--window-position=0,0",
        "--force-device-scale-factor=1.25",
        "--hide-scrollbars",
        "--disable-infobars",
        "--no-first-run",
        "--no-default-browser-check",
        "--disable-features=Translate,MediaRouter",
      ],
    });
    const context = await browser.newContext({
      viewport: null,
      locale: "pt-BR",
      timezoneId: "America/Sao_Paulo",
    });
    await context.addInitScript(initScript);
    const page = await context.newPage();
    page.setDefaultTimeout(20000);

    const cdp = await context.newCDPSession(page);
    const { windowId } = await cdp.send("Browser.getWindowForTarget");
    await cdp.send("Browser.setWindowBounds", {
      windowId,
      bounds: { windowState: "fullscreen" },
    });
    await sleep(4500);

    await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    await sleep(1500);

    await page.mouse.move(960, 540);
    await sleep(500);
    console.log(
      "window:",
      JSON.stringify(
        await page.evaluate(() => ({
          w: innerWidth,
          h: innerHeight,
          dpr: devicePixelRatio,
        })),
      ),
    );

    ff = spawn(
      FFMPEG,
      [
        "-y",
        "-f", "gdigrab",
        "-framerate", "60",
        "-draw_mouse", "0",
        "-use_wallclock_as_timestamps", "1",
        "-i", "desktop",
        "-r", "60",
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", "20",
        "-pix_fmt", "yuv420p",
        RAW,
      ],
      { stdio: ["pipe", "ignore", "ignore"] },
    );
    REC_START = Date.now();
    await sleep(900);

    await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    await sleep(1700);
    await page.evaluate(() => {
      const i = document.getElementById("demo-intro");
      if (i) i.classList.add("hide");
    });
    await sleep(650);
    await page.evaluate(() => document.getElementById("demo-intro")?.remove());
    await caption(page, "Landing Page");
    await page.mouse.move(960, 540, { steps: 18 });
    await smoothScroll(page, 600, 800);
    await sleep(800);
    await smoothScroll(page, 0, 600);
    await sleep(300);

    await page.goto(BASE + "/auth", { waitUntil: "domcontentloaded" });
    await sleep(1200);
    await caption(page, "Login seguro");
    const email = page.locator('input[type="email"]').first();
    await moveToEl(page, email);
    await sleep(180);
    await email.click();
    await email.pressSequentially("demo@autosystem.dev", { delay: 28 });
    const pass = page.locator('input[type="password"]').first();
    await moveToEl(page, pass);
    await sleep(140);
    await pass.click();
    await pass.pressSequentially("Demo1234", { delay: 42 });
    await sleep(220);
    const entrar = page.getByRole("button", { name: /entrar/i }).first();
    await moveToEl(page, entrar);
    await sleep(220);
    await entrar.click();
    const tLoginClick = Date.now();
    await page.waitForURL("**/dashboard", { timeout: 30000 }).catch(() => {});
    await settle(page, 1700);
    addGap(tLoginClick, Date.now(), 1700);

    await caption(page, "Dashboard");
    await page.mouse.move(1050, 380, { steps: 20 });
    await sleep(800);
    await smoothScroll(page, 430, 750);
    await sleep(900);
    await smoothScroll(page, 0, 550);
    await sleep(350);

    await clickSidebar(page, "Orçamentos", "Orçamentos");
    await sleep(650);
    await smoothScroll(page, 340, 750);
    await sleep(850);
    const budgetLink = page.locator('a[href^="/dashboard/budget/"]').first();
    if (await budgetLink.count()) {
      await moveToEl(page, budgetLink);
      await sleep(300);
      await caption(page, "Detalhe do orçamento");
      const prevBudget = await mainText(page);
      const tBudgetClick = Date.now();
      await budgetLink.click();
      await page.waitForURL("**/dashboard/budget/**", { timeout: 20000 }).catch(() => {});
      await waitContentChange(page, prevBudget);
      await settle(page, 700);
      addGap(tBudgetClick, Date.now(), 700);
      await page.mouse.move(1120, 470, { steps: 18 });
      await sleep(700);
      await smoothScroll(page, 240, 650);
      await sleep(900);
    }

    await clickSidebar(page, "Ordens de Serviço", "Ordens de Serviço");
    await sleep(600);
    await smoothScroll(page, 300, 650);
    await sleep(800);
    const osLink = page.locator('a[href^="/dashboard/service/"]').first();
    if (await osLink.count()) {
      await moveToEl(page, osLink);
      await sleep(280);
      await caption(page, "Detalhe da O.S.");
      const prevOs = await mainText(page);
      const tOsClick = Date.now();
      await osLink.click();
      await page.waitForURL("**/dashboard/service/**", { timeout: 20000 }).catch(() => {});
      await waitContentChange(page, prevOs);
      await settle(page, 700);
      addGap(tOsClick, Date.now(), 700);
      await sleep(700);
      await smoothScroll(page, 260, 650);
      await sleep(850);
    }

    await clickSidebar(page, "Clientes", "CRM de clientes");
    await sleep(650);
    await smoothScroll(page, 300, 650);
    await sleep(850);

    await clickSidebar(page, "Veículos", "Veículos");
    await sleep(650);
    await smoothScroll(page, 300, 650);
    await sleep(850);

    await clickSidebar(page, "Estoque", "Controle de estoque");
    await sleep(650);
    await smoothScroll(page, 300, 650);
    await sleep(850);

    await clickSidebar(page, "Financeiro", "Financeiro");
    await sleep(700);
    await smoothScroll(page, 320, 650);
    await sleep(900);

    await clickSidebar(page, "Relatórios", "Relatórios estratégicos");
    await sleep(750);
    await smoothScroll(page, 300, 650);
    await sleep(950);

    await clickSidebar(page, "Dashboard", "AutoSystem");
    await page.mouse.move(960, 480, { steps: 20 });
    await sleep(1100);
    await page.evaluate(() => {
      document.getElementById("demo-caption")?.classList.remove("show");
      const c = document.getElementById("demo-cursor");
      if (c) c.style.display = "none";
      document.getElementById("demo-outro")?.classList.add("show");
    });
    await sleep(3600);
  } catch (err) {
    console.error("ERRO NO DEMO:", err.message);
  } finally {
    const wallDur = (Date.now() - REC_START) / 1000;
    await stopFF();
    if (browser) await browser.close().catch(() => {});
    stopServer();
    await sleep(300);
    console.log("wall duration:", wallDur.toFixed(2));
    console.log("RAW:", RAW, fs.existsSync(RAW) ? fs.statSync(RAW).size + " bytes" : "ausente");
    if (fs.existsSync(RAW)) {
      let r;
      const filter = cutFilter();
      if (filter) {
        r = spawnSync(
          FFMPEG,
          [
            "-y", "-i", RAW,
            "-vf", filter,
            "-r", "60",
            "-c:v", "libx264", "-preset", "veryfast", "-crf", "20",
            "-pix_fmt", "yuv420p",
            "-movflags", "+faststart",
            FINAL,
          ],
          { stdio: "ignore" },
        );
        console.log("Cuts applied");
      } else {
        r = spawnSync(
          FFMPEG,
          ["-y", "-i", RAW, "-c", "copy", "-movflags", "+faststart", FINAL],
          { stdio: "ignore" },
        );
      }
      console.log("Remux exit:", r.status, fs.existsSync(FINAL) ? FINAL : "");
    }
  }
})();
