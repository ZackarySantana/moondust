#!/usr/bin/env node
/**
 * Interactive version pick, then ensure cached release binary exists and exec.
 * Releases: https://github.com/zackarysantana/moondust — assets moondust_<semver>_<os>_<arch>.{tar.gz,zip}.
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, copyFileSync, unlinkSync, rmSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline/promises";

import { getTargetTriple, assetBasename } from "../lib/platform.js";
import {
  getLatestReleaseTag,
  listRecentReleases,
  releaseTagExists,
  getReleaseAssetUrl,
} from "../lib/github.js";
import {
  downloadToFile,
  extractArchive,
  findBinaryInDir,
  tempDownloadPath,
  ensureExecutable,
} from "../lib/download.js";

/** GitHub owner/repo for releases (API + assets). */
const GITHUB_REPO = "zackarysantana/moondust";

function semverFromTag(tag) {
  return tag.replace(/^v/i, "").trim();
}

/** User input like "0.1.0" or "v0.1.0" → "v0.1.0" */
function tagFromUserVersion(raw) {
  const t = raw.trim();
  if (!t) return null;
  return t.startsWith("v") ? t : `v${t}`;
}

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

async function chooseVersionInteractive() {
  const rl = createInterface({ input: stdin, output: stdout });
  try {
    const line = await rl.question("Use latest version? [Y/n] ");
    const useLatest = line.trim() === "" || /^y(es)?$/i.test(line.trim());

    if (useLatest) {
      const tag = await getLatestReleaseTag(GITHUB_REPO);
      return semverFromTag(tag);
    }

    const releases = await listRecentReleases(GITHUB_REPO, 5);
    if (releases.length === 0) {
      throw new Error(`No releases found for ${GITHUB_REPO}.`);
    }

    console.log("\nRecent releases:");
    for (let i = 0; i < releases.length; i++) {
      const r = releases[i];
      const title = r.name || r.tag_name;
      const when = r.published_at
        ? new Date(r.published_at).toISOString().slice(0, 10)
        : "";
      console.log(
        `  ${i + 1}. ${r.tag_name} — ${title}${when ? ` — ${when}` : ""}`,
      );
    }
    console.log("  … (Older releases may exist on GitHub.)\n");

    for (;;) {
      const raw = await rl.question(
        "Enter version to install (e.g. 0.1.0): ",
      );
      const tag = tagFromUserVersion(raw);
      if (!tag) {
        console.error("Please enter a version.");
        continue;
      }
      const exists = await releaseTagExists(GITHUB_REPO, tag);
      if (!exists) {
        console.error(
          `No release found for ${tag}. Check the tag and try again.`,
        );
        continue;
      }
      return semverFromTag(tag);
    }
  } finally {
    rl.close();
  }
}

async function resolveVersion() {
  if (!stdin.isTTY) {
    const tag = await getLatestReleaseTag(GITHUB_REPO);
    return semverFromTag(tag);
  }
  return chooseVersionInteractive();
}

async function main() {
  const version = await resolveVersion();
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
