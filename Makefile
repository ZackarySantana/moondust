# Dist targets match .github/workflows/release.yml jobs.
# Optional: RELEASE_LABEL=v1.2.3 make dist-linux-amd64 — embeds that string (release tag).
# Omitted uses the default dev label from internal/buildinfo.
.PHONY: dev frontend dist-linux-amd64 dist-linux-arm64 dist-windows-amd64 dist-windows-arm64 dist-darwin-arm64

WAILS_LDFLAGS :=
ifneq ($(strip $(RELEASE_LABEL)),)
WAILS_LDFLAGS := -ldflags "-X moondust/internal/buildinfo.DisplayLabel=$(RELEASE_LABEL)"
endif

dev:
	wails dev -tags webkit2_41

frontend:
	cd frontend && bun install && bun run build

dist-linux-amd64: frontend
	wails build -platform linux/amd64 -tags webkit2_41 -o moondust $(WAILS_LDFLAGS)

dist-linux-arm64: frontend
	wails build -platform linux/arm64 -tags webkit2_41 -o moondust $(WAILS_LDFLAGS)

dist-windows-amd64: frontend
	wails build -platform windows/amd64 -o moondust.exe $(WAILS_LDFLAGS)

dist-windows-arm64: frontend
	wails build -platform windows/arm64 -o moondust.exe $(WAILS_LDFLAGS)

dist-darwin-arm64: frontend
	wails build -platform darwin/arm64 -o moondust $(WAILS_LDFLAGS)
