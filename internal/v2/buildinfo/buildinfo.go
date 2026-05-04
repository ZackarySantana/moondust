// Package buildinfo holds link-time metadata for the desktop binary.
package buildinfo

// DisplayLabel is shown in the app shell (e.g. sidebar). Release CI sets this
// via GOFLAGS `-ldflags=-X=moondust/internal/v2/buildinfo.DisplayLabel=<tag>` (avoid a space after -X — GOFLAGS is space-split).
var DisplayLabel = "dev build"
