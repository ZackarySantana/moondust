package client

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"runtime"
)

type auth struct {
	AccessToken  string `json:"accessToken"`
	RefreshToken string `json:"refreshToken"`
}

func getAccessToken() (*auth, error) {
	paths, err := cursorAuthPaths()
	if err != nil {
		return nil, fmt.Errorf("getting cursor auth paths: %w", err)
	}
	for _, p := range paths {
		data, err := os.ReadFile(p)
		if err != nil {
			continue
		}
		var af auth
		if err := json.Unmarshal(data, &af); err != nil {
			continue
		}
		if af.AccessToken != "" {
			return &af, nil
		}
	}
	return nil, fmt.Errorf("no cursor access token found")
}

func cursorAuthPaths() ([]string, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return nil, fmt.Errorf("failed to get user home directory: %w", err)
	}
	out := []string{filepath.Join(home, ".config", "cursor", "auth.json")}
	switch runtime.GOOS {
	case "windows":
		if app := os.Getenv("APPDATA"); app != "" {
			out = append(out, filepath.Join(app, "Cursor", "auth.json"))
		}
	case "darwin":
		out = append(out, filepath.Join(home, "Library", "Application Support", "Cursor", "auth.json"))
	}
	return out, nil
}
