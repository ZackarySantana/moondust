package rand

import (
	cryptorand "crypto/rand"
	"encoding/hex"
)

// Text returns a random hex string suitable for message and entity IDs.
func Text() string {
	b := make([]byte, 16)
	_, _ = cryptorand.Read(b)
	return hex.EncodeToString(b)
}
