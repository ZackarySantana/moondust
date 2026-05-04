# Dist targets mirror .github/workflows/release.yml jobs.
# Optional: RELEASE_LABEL=v1.2.3 make dist-linux-amd64 — embeds that string via GOFLAGS (release tag).
# Omitted uses the dev label from internal/v2/buildinfo.
#
# Prerequisites: sash CLI (`go install github.com/zackarysantana/sash/cmd/sash@latest`).
.PHONY: dev frontend dist-linux-amd64 dist-linux-arm64 dist-windows-amd64 dist-windows-arm64 dist-darwin-arm64

ifneq ($(strip $(RELEASE_LABEL)),)
export GOFLAGS := -ldflags=-X moondust/internal/v2/buildinfo.DisplayLabel=$(RELEASE_LABEL)
endif

DEV_PATH := $(shell go env GOPATH)/bin

frontend:
	cd packages && bun install && bun run --filter @moondust/studio build

dev:
	PATH="$(DEV_PATH):$$PATH" sash dev

dist-linux-amd64: frontend
	GOOS=linux GOARCH=amd64 PATH="$(DEV_PATH):$$PATH" sash build

dist-linux-arm64: frontend
	GOOS=linux GOARCH=arm64 PATH="$(DEV_PATH):$$PATH" sash build

dist-windows-amd64: frontend
	GOOS=windows GOARCH=amd64 PATH="$(DEV_PATH):$$PATH" sash build

dist-windows-arm64: frontend
	GOOS=windows GOARCH=arm64 PATH="$(DEV_PATH):$$PATH" sash build

dist-darwin-arm64: frontend
	GOOS=darwin GOARCH=arm64 PATH="$(DEV_PATH):$$PATH" sash build
