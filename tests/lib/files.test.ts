import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isImageFile, safeFileName } from "@/lib/files";

describe("safeFileName", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-22T12:00:00.000Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  const stamp = new Date("2026-10-22T12:00:00.000Z").getTime();

  it("prefixa com o timestamp e mantém nomes simples", () => {
    expect(safeFileName("foto.png")).toBe(`${stamp}-foto.png`);
  });

  it("troca espaços e caracteres especiais por hífen", () => {
    expect(safeFileName("minha foto (1).jpg")).toBe(`${stamp}-minha-foto-1-.jpg`);
  });

  it.each([
    ["../../etc/passwd", "passwd"],
    ["..\\..\\windows\\system32\\evil.dll", "evil.dll"],
    ["/var/www/shell.php", "shell.php"],
    ["C:\\Users\\x\\logo.png", "logo.png"],
  ])("neutraliza caminhos: %s", (input, expected) => {
    const name = safeFileName(input);
    expect(name).toBe(`${stamp}-${expected}`);
    expect(name).not.toContain("/");
    expect(name).not.toContain("\\");
    expect(name).not.toContain("..");
  });

  it("remove pontos e hífens do começo", () => {
    expect(safeFileName("...oculto.png")).toBe(`${stamp}-oculto.png`);
  });

  it("usa 'arquivo' quando sobra nada", () => {
    expect(safeFileName("")).toBe(`${stamp}-arquivo`);
    expect(safeFileName("///")).toBe(`${stamp}-arquivo`);
  });

  it("limita o tamanho do nome", () => {
    const name = safeFileName(`${"a".repeat(300)}.png`);
    expect(name.length).toBeLessThanOrEqual(`${stamp}-`.length + 100);
    expect(name.endsWith(".png")).toBe(true);
  });
});

describe("isImageFile", () => {
  it.each(["image/png", "image/jpeg", "image/webp", "image/svg+xml"])(
    "aceita %s",
    (type) => {
      expect(isImageFile({ type })).toBe(true);
    },
  );

  it.each(["application/pdf", "text/html", "application/x-php", "", undefined])(
    "recusa %s",
    (type) => {
      expect(isImageFile({ type })).toBe(false);
    },
  );
});
