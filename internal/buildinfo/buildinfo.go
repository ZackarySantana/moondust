// Package buildinfo holds link-time metadata for the desktop binary.
package buildinfo

// DisplayLabel is shown in the app shell (e.g. sidebar). Release CI sets this
// via -ldflags "-X moondust/internal/buildinfo.DisplayLabel=<git tag>".
var DisplayLabel = "dev build"
