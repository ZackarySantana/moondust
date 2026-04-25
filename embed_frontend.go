package frontenddist

import "embed"

//go:embed all:packages/studio/dist
var Assets embed.FS
