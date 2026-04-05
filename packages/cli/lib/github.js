/**
 * Resolve download URL for a release asset from GitHub's API.
 */
export async function getReleaseAssetUrl(repo, tag, assetName, token) {
  const url = `https://api.github.com/repos/${repo}/releases/tags/${encodeURIComponent(tag)}`;
  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "moondust-npm-cli",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { headers });
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
