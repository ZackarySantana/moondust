/**
 * Maps Node's platform/arch to release asset names (.github/workflows/release.yml).
 */
export function getTargetTriple() {
    const platform = process.platform;
    const arch = process.arch;

    if (platform === "win32") {
        if (arch === "x64" || arch === "ia32")
            return { os: "windows", arch: "amd64", ext: ".exe" };
        if (arch === "arm64")
            return { os: "windows", arch: "arm64", ext: ".exe" };
    }
    if (platform === "darwin") {
        if (arch === "arm64") return { os: "darwin", arch: "arm64", ext: "" };
        if (arch === "x64") return { os: "darwin", arch: "amd64", ext: "" };
    }
    if (platform === "linux") {
        if (arch === "x64") return { os: "linux", arch: "amd64", ext: "" };
        if (arch === "arm64") return { os: "linux", arch: "arm64", ext: "" };
    }

    throw new Error(
        `Unsupported platform: ${platform} ${arch}. Build or download a binary for this OS manually.`,
    );
}

export function assetBasename(version, triple) {
    const v = version.replace(/^v/, "");
    return `moondust_${v}_${triple.os}_${triple.arch}`;
}
