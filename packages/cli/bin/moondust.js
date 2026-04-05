#!/usr/bin/env node
/**
 * Moondust npm entry: ensure cached release binary exists, then exec with argv forwarded.
 *
 * Expects GitHub Releases with assets named:
 *   moondust_<semver>_linux_amd64.tar.gz
 *   moondust_<semver>_darwin_arm64.tar.gz
 *   moondust_<semver>_windows_amd64.zip
 * (see RELEASE_ASSETS.md in repo root)
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

function githubRepoFromPackage(p) {
  const url = p.repository?.url;
  if (!url) return null;
  const m = String(url)
    .replace(/\.git$/, "")
    .match(/github\.com\/([^/]+)\/([^/]+)/i);
  return m ? `${m[1]}/${m[2]}` : null;
}

const REPO = process.env.MOONDUST_GITHUB_REPO ?? githubRepoFromPackage(pkg);

const GITHUB_TOKEN = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;

function cacheDir(version) {
  const base =
    process.env.MOONDUST_CACHE_DIR ??
    path.join(os.homedir(), ".cache", "moondust", version);
  return base;
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

  if (!REPO || !REPO.includes("/")) {
    throw new Error(
      "Set MOONDUST_GITHUB_REPO to owner/repo (e.g. myorg/moondust) or add repository.url to packages/cli/package.json",
    );
  }

  const url = await getReleaseAssetUrl(REPO, tag, archiveName, GITHUB_TOKEN);
  const tmpArchive = tempDownloadPath("moondust") + (isZip ? ".zip" : ".tar.gz");
  const extractRoot = tempDownloadPath("moondust-extract");

  try {
    await downloadToFile(url, tmpArchive, GITHUB_TOKEN);
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
