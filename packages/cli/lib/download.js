import { createWriteStream } from "node:fs";
import { mkdir, chmod, stat } from "node:fs/promises";
import { pipeline } from "node:stream/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { randomBytes } from "node:crypto";
import extractZip from "extract-zip";
import { x as extractTar } from "tar";

export async function downloadToFile(url, destPath, token) {
  const headers = { "User-Agent": "moondust-npm-cli" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Download failed ${res.status}: ${text.slice(0, 300)}`);
  }
  await mkdir(path.dirname(destPath), { recursive: true });
  const tmp = `${destPath}.${randomBytes(8).toString("hex")}.part`;
  await pipeline(res.body, createWriteStream(tmp));
  const { rename } = await import("node:fs/promises");
  await rename(tmp, destPath);
}

export async function extractArchive(archivePath, outDir, isZip) {
  await mkdir(outDir, { recursive: true });
  if (isZip) {
    await extractZip(archivePath, { dir: outDir });
  } else {
    await extractTar({ file: archivePath, cwd: outDir });
  }
}

export async function findBinaryInDir(dir, baseName, ext) {
  const expected = `${baseName}${ext}`;
  const direct = path.join(dir, expected);
  try {
    await stat(direct);
    return direct;
  } catch {
    // walk one level
  }
  const { readdir } = await import("node:fs/promises");
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.isDirectory()) {
      const p = path.join(dir, e.name, expected);
      try {
        await stat(p);
        return p;
      } catch {
        /* continue */
      }
    }
  }
  throw new Error(`Could not find ${expected} inside extracted archive (looked in ${dir})`);
}

export function tempDownloadPath(prefix) {
  return path.join(tmpdir(), `${prefix}-${randomBytes(8).toString("hex")}`);
}

export async function ensureExecutable(filePath) {
  if (process.platform === "win32") return;
  const s = await stat(filePath);
  await chmod(filePath, s.mode | 0o111);
}
