package cursorcli

import (
	"encoding/json"
	"os"
	"path/filepath"
	"runtime"
)

type cursorAuthFile struct {
	AccessToken string `json:"accessToken"`
}

// readCursorAccessToken loads ~/.config/cursor/auth.json (and common OS paths).
func readCursorAccessToken() (string, error) {
	for _, p := range cursorAuthPaths() {
		data, err := os.ReadFile(p)
		if err != nil {
			continue
		}
		var af cursorAuthFile
		if err := json.Unmarshal(data, &af); err != nil {
			continue
		}
		if af.AccessToken != "" {
			return af.AccessToken, nil
		}
	}
	return "", os.ErrNotExist
}

func cursorAuthPaths() []string {
	home, err := os.UserHomeDir()
	if err != nil {
		return nil
	}
	var out []string
	switch runtime.GOOS {
	case "windows":
		if app := os.Getenv("APPDATA"); app != "" {
			out = append(out, filepath.Join(app, "Cursor", "auth.json"))
		}
		out = append(out, filepath.Join(home, ".config", "cursor", "auth.json"))
	default:
		out = append(out, filepath.Join(home, ".config", "cursor", "auth.json"))
		if runtime.GOOS == "darwin" {
			out = append(out, filepath.Join(home, "Library", "Application Support", "Cursor", "auth.json"))
		}
	}
	return out
}
