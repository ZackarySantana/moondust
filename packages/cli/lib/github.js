const HEADERS = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "moondust-npm-cli",
};

async function githubJson(url) {
  const res = await fetch(url, { headers: HEADERS });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`GitHub API ${res.status}: ${text.slice(0, 500)}`);
  }
  return text ? JSON.parse(text) : null;
}

/**
 * Latest non-prerelease release tag, or newest tag if /latest is missing.
 */
export async function getLatestReleaseTag(repo) {
  const latestUrl = `https://api.github.com/repos/${repo}/releases/latest`;
  const res = await fetch(latestUrl, { headers: HEADERS });
  if (res.ok) {
    const data = await res.json();
    return data.tag_name;
  }
  if (res.status === 404) {
    const arr = await githubJson(
      `https://api.github.com/repos/${repo}/releases?per_page=1`,
    );
    if (!Array.isArray(arr) || arr.length === 0) {
      throw new Error(`No releases found for ${repo}.`);
    }
    return arr[0].tag_name;
  }
  const text = await res.text();
  throw new Error(`GitHub API ${res.status}: ${text.slice(0, 500)}`);
}

/** Most recent releases (newest first), up to `limit`. */
export async function listRecentReleases(repo, limit) {
  const data = await githubJson(
    `https://api.github.com/repos/${repo}/releases?per_page=${limit}`,
  );
  return Array.isArray(data) ? data : [];
}

/**
 * True if a release exists for this tag (e.g. v0.1.0).
 */
export async function releaseTagExists(repo, tag) {
  const url = `https://api.github.com/repos/${repo}/releases/tags/${encodeURIComponent(tag)}`;
  const res = await fetch(url, { headers: HEADERS });
  return res.ok;
}

/**
 * Resolve download URL for a release asset from GitHub's API (public repos).
 */
export async function getReleaseAssetUrl(repo, tag, assetName) {
  const url = `https://api.github.com/repos/${repo}/releases/tags/${encodeURIComponent(tag)}`;
  const res = await fetch(url, { headers: HEADERS });
  if (res.status === 404) {
    throw new Error(
      `Release ${tag} not found for ${repo}. Publish a GitHub Release with that tag and matching assets.`,
    );
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API ${res.status}: ${text.slice(0, 500)}`);
  }

  const data = await res.json();
  const assets = data.assets ?? [];
  const match = assets.find((a) => a.name === assetName);
  if (!match) {
    const names = assets.map((a) => a.name).join(", ");
    throw new Error(
      `No asset named "${assetName}" on ${tag}. Available: ${names || "(none)"}`,
    );
  }
  return match.browser_download_url;
}
