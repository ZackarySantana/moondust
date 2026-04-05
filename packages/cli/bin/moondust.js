#!/usr/bin/env node
/**
 * Ensure the cached release binary exists, then exec with argv forwarded.
 * Release: tag v<semver> from package version; assets moondust_<semver>_<os>_<arch>.{tar.gz,zip}.
 */
import { spawn } from "node:child_process";
import { readFileSync, existsSync, mkdirSync, copyFileSync, unlinkSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import os from "node:os";

import { getTargetTriple, assetBasename } from "../lib/platform.js";
import { getReleaseAssetUrl } from "../lib/github.js";
import {
  downloadToFile,
  extractArchive,
  findBinaryInDir,
  tempDownloadPath,
  ensureExecutable,
} from "../lib/download.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(path.join(__dirname, "..", "package.json"), "utf8"));

/** GitHub owner/repo for releases (API + assets). */
const GITHUB_REPO = "zackarysantana/moondust";

function cacheDir(version) {
  return path.join(os.homedir(), ".cache", "moondust", version);
}

function binaryName(ext) {
  return `moondust${ext}`;
}

async function ensureBinary(version, triple) {
  const base = assetBasename(version, triple);
  const isZip = triple.os === "windows";
  const archiveName = isZip ? `${base}.zip` : `${base}.tar.gz`;
  const tag = version.startsWith("v") ? version : `v${version}`;
  const destDir = cacheDir(version);
  const cached = path.join(destDir, binaryName(triple.ext));

  if (existsSync(cached)) {
    return cached;
  }

  const url = await getReleaseAssetUrl(GITHUB_REPO, tag, archiveName);
  const tmpArchive = tempDownloadPath("moondust") + (isZip ? ".zip" : ".tar.gz");
  const extractRoot = tempDownloadPath("moondust-extract");

  try {
    await downloadToFile(url, tmpArchive);
    await extractArchive(tmpArchive, extractRoot, isZip);
    const found = await findBinaryInDir(extractRoot, "moondust", triple.ext);
    mkdirSync(destDir, { recursive: true });
    copyFileSync(found, cached);
    await ensureExecutable(cached);
  } finally {
    try {
      unlinkSync(tmpArchive);
    } catch {
      /* ignore */
    }
    try {
      rmSync(extractRoot, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  }

  return cached;
}

async function main() {
  const version = pkg.version;
  const triple = getTargetTriple();
  const binPath = await ensureBinary(version, triple);

  const child = spawn(binPath, process.argv.slice(2), {
    stdio: "inherit",
    env: process.env,
    windowsHide: false,
  });
  child.on("exit", (code, signal) => {
    if (signal) process.kill(process.pid, signal);
    else process.exit(code ?? 1);
  });
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
