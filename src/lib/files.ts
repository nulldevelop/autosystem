import { basename } from "node:path";

/** Nome seguro para gravar em disco: sem caminhos (../), só caracteres simples. */
export function safeFileName(name: string) {
  const base = basename(name.replaceAll("\\", "/"))
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/^[.-]+/, "")
    .slice(-100);
  return `${Date.now()}-${base || "arquivo"}`;
}

export function isImageFile(file: { type?: string }) {
  return Boolean(file.type?.startsWith("image/"));
}
