/**
 * Gravador de tela compartilhado pelos vídeos de demonstração (desktop e mobile).
 *
 * Por que assim
 *  - Pedir uma "foto" da página ao Chrome a cada quadro é lento (20-35 fps), pesa a máquina e pode
 *    sair rasgado. O ffmpeg lê a tela do Windows direto (gdigrab) a 60 fps, sem depender do Chrome.
 *  - As esperas de carregamento (cortina fechada) são cortadas depois, pelo horário exato de cada
 *    pausa. O gdigrab carimba cada quadro com o relógio do sistema, então o corte é preciso.
 *  - A gravação bruta é quase sem perdas; a conversão final marca BT.709 (cores corretas em players
 *    e redes sociais).
 */
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { spawn, spawnSync } = require("node:child_process");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** region: { x, y, width, height } em pixels da tela. */
function createScreenRecorder({ ffmpeg, ffprobe, region, raw, fps = 60 }) {
  const pauses = []; // { from, to } em segundos (relógio do sistema)
  let proc = null;
  let startedAt = 0;
  let stoppedAt = 0;
  let stderr = "";
  const now = () => Date.now() / 1000;
  const paused = () => pauses.length > 0 && pauses[pauses.length - 1].to === null;

  const rec = {
    pauses,
    async start() {
      fs.rmSync(raw, { force: true });
      const args = [
        "-y", "-hide_banner",
        "-f", "gdigrab", "-framerate", String(fps), "-draw_mouse", "0",
        "-offset_x", String(region.x), "-offset_y", String(region.y),
        "-video_size", `${region.width}x${region.height}`,
        "-use_wallclock_as_timestamps", "1",
        "-i", "desktop",
        "-copyts", "-fps_mode", "passthrough",
        "-c:v", "libx264", "-preset", "ultrafast", "-crf", "10", "-pix_fmt", "yuv444p",
        raw,
      ];
      proc = spawn(ffmpeg, args, { stdio: ["pipe", "ignore", "pipe"] });
      proc.stderr.on("data", (d) => {
        stderr = (stderr + d).slice(-4000);
      });
      // espera a primeira imagem sair (o ffmpeg imprime "frame=" quando começa a gravar)
      const t0 = Date.now();
      while (!/frame=\s*\d+/.test(stderr) && Date.now() - t0 < 15000) await sleep(50);
      startedAt = now();
    },
    pause() {
      if (!paused()) pauses.push({ from: now(), to: null });
    },
    resume() {
      if (paused()) pauses[pauses.length - 1].to = now();
    },
    async stop() {
      stoppedAt = now();
      if (paused()) rec.resume();
      if (!proc) return;
      await sleep(300);
      proc.stdin.write("q");
      await new Promise((r) => proc.on("close", r));
      proc = null;
    },
    /** Primeiro carimbo de tempo do arquivo bruto (segundos do relógio do sistema). */
    firstPts() {
      const r = spawnSync(
        ffprobe,
        ["-v", "error", "-select_streams", "v:0", "-read_intervals", "%+#1", "-show_entries", "packet=pts_time", "-of", "csv=p=0", raw],
        { encoding: "utf8" },
      );
      return parseFloat(String(r.stdout).split(/\s+/)[0]);
    },
    /** Trechos mantidos, em segundos do relógio do sistema. */
    segments(t0) {
      const out = [];
      let cur = Math.max(t0, startedAt);
      for (const p of pauses) {
        // margem: a cortina já está fechada no começo da pausa e continua um pouco depois dela
        const a = p.from + 0.1;
        const b = p.to;
        if (a > cur) out.push([cur, a]);
        cur = Math.max(cur, b);
      }
      if (stoppedAt > cur) out.push([cur, stoppedAt]);
      return out.filter(([a, b]) => b - a > 0.05);
    },
  };
  return rec;
}

/**
 * Codifica o bruto em MP4 final, sem as pausas.
 * opts: { rec, raw, out, width, height, fps, crf, preset, level, music, ffmpeg, ffprobe, poster, posterAt, log, crop }
 */
function encodeScreen(opts) {
  const {
    rec, raw, out, width, height, fps = 60, crf = 15, preset = "slow", level = "4.2",
    music = "", ffmpeg, ffprobe, poster, posterAt = 3, log = console.log,
  } = opts;

  const t0 = rec.firstPts();
  if (!Number.isFinite(t0)) {
    log("Gravação bruta vazia ou ilegível.");
    return { ok: false };
  }
  const segs = rec.segments(t0);
  const total = segs.reduce((s, [a, b]) => s + (b - a), 0);
  log(`Montando ${segs.length} trechos (${total.toFixed(1)} s) a ${fps} fps em ${width}x${height}...`);

  const parts = segs.map(
    ([a, b], i) => `[0:v]trim=start=${a.toFixed(3)}:end=${b.toFixed(3)},setpts=PTS-STARTPTS[v${i}]`,
  );
  const labels = segs.map((_, i) => `[v${i}]`).join("");
  const filter =
    `${parts.join(";")};${labels}concat=n=${segs.length}:v=1:a=0,` +
    `fps=${fps},scale=${width}:${height}:flags=lanczos+accurate_rnd+full_chroma_int:out_color_matrix=bt709:out_range=tv,` +
    `format=yuv420p,setparams=colorspace=bt709:color_primaries=bt709:color_trc=bt709:range=tv[v]`;

  const scriptFile = path.join(path.dirname(raw), "filter.txt");
  fs.writeFileSync(scriptFile, filter);

  const args = ["-y", "-hide_banner", "-copyts", "-i", raw];
  const withMusic = music && fs.existsSync(music);
  if (withMusic) args.push("-i", music);
  args.push("-/filter_complex", scriptFile, "-map", "[v]");
  args.push(
    "-c:v", "libx264", "-preset", preset, "-crf", String(crf),
    "-profile:v", "high", "-level", level, "-pix_fmt", "yuv420p",
    "-x264-params", "deblock=-1,-1:aq-mode=3:aq-strength=0.8",
    "-g", String(fps * 2),
    "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv",
    "-movflags", "+faststart",
  );
  args.push("-an"); // a música entra num segundo passo, mais simples e seguro
  const tmpVideo = withMusic ? out + ".semaudio.mp4" : out;
  args.push(tmpVideo);

  const r = spawnSync(ffmpeg, args, { stdio: ["ignore", "pipe", "pipe"], maxBuffer: 400 * 1024 * 1024 });
  fs.rmSync(scriptFile, { force: true });
  if (r.status !== 0) {
    log("Falha na codificação:", String(r.stderr).slice(-900));
    return { ok: false };
  }

  if (withMusic) {
    const m = spawnSync(
      ffmpeg,
      [
        "-y", "-hide_banner", "-i", tmpVideo, "-i", music,
        "-filter_complex",
        `[1:a]atrim=0:${total.toFixed(2)},afade=t=in:st=0:d=1.5,afade=t=out:st=${Math.max(0, total - 2.5).toFixed(2)}:d=2.5,volume=0.5[a]`,
        "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest",
        "-movflags", "+faststart", out,
      ],
      { stdio: ["ignore", "pipe", "pipe"] },
    );
    fs.rmSync(tmpVideo, { force: true });
    if (m.status !== 0) {
      log("Falha ao juntar a música:", String(m.stderr).slice(-600));
      return { ok: false };
    }
  }

  const probe = spawnSync(ffprobe, ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", out], {
    encoding: "utf8",
  });
  const dur = parseFloat(probe.stdout) || total;
  log(`Pronto: ${out} (${dur.toFixed(1)} s, ${(fs.statSync(out).size / 1048576).toFixed(1)} MB)`);
  if (poster) {
    spawnSync(ffmpeg, ["-y", "-ss", String(posterAt), "-i", out, "-frames:v", "1", "-q:v", "2", poster], { stdio: "ignore" });
    if (fs.existsSync(poster)) log("Pôster:", poster);
  }
  return { ok: true, duration: dur };
}

module.exports = { createScreenRecorder, encodeScreen };
