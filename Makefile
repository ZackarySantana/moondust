# Dist targets match .github/workflows/release.yml jobs.
.PHONY: dev frontend dist-linux-amd64 dist-linux-arm64 dist-windows-amd64 dist-windows-arm64 dist-darwin-arm64

dev:
	wails dev -tags webkit2_41

frontend:
	cd frontend && bun install && bun run build

dist-linux-amd64: frontend
	wails build -platform linux/amd64 -tags webkit2_41 -o moondust

dist-linux-arm64: frontend
	wails build -platform linux/arm64 -tags webkit2_41 -o moondust

dist-windows-amd64: frontend
	wails build -platform windows/amd64 -o moondust.exe

dist-windows-arm64: frontend
	wails build -platform windows/arm64 -o moondust.exe

dist-darwin-arm64: frontend
	wails build -platform darwin/arm64 -o moondust
