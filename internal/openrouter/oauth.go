// Package openrouter implements OpenRouter OAuth (PKCE) browser flow for desktop apps.
// See https://openrouter.ai/docs/guides/overview/auth/oauth
package openrouter

import (
	"bytes"
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/url"
	"strings"
	"time"
)

const (
	authURL     = "https://openrouter.ai/auth"
	exchangeURL = "https://openrouter.ai/api/v1/auth/keys"
	// OpenRouter only allows fixed localhost callback URLs (e.g. http://localhost:3000) for OAuth.
	// Random ports cause 409 errors when creating the auth code.
	// See: https://openrouter.ai/docs/guides/overview/auth/oauth
	oauthLocalCallbackPort = "3000"
	oauthCallbackPath      = "/oauth/callback"
)

// BrowserOAuthFlow runs the full PKCE flow: local callback server, opens authURL in the
// system browser, exchanges the authorization code for an API key.
// openBrowser must return an error if the URL could not be opened (so the user sees a clear failure).
func BrowserOAuthFlow(ctx context.Context, openBrowser func(authURL string) error) (apiKey string, err error) {
	verifier, err := newCodeVerifier()
	if err != nil {
		return "", fmt.Errorf("pkce verifier: %w", err)
	}
	challenge := codeChallengeS256(verifier)

	callbackURL := "http://localhost:" + oauthLocalCallbackPort + oauthCallbackPath
	listener, err := net.Listen("tcp", "127.0.0.1:"+oauthLocalCallbackPort)
	if err != nil {
		return "", fmt.Errorf(
			"could not listen on port %s (OpenRouter requires http://localhost:%s for OAuth). "+
				"Stop whatever is using that port and try again: %w",
			oauthLocalCallbackPort, oauthLocalCallbackPort, err,
		)
	}

	codeCh := make(chan string, 1)
	errCh := make(chan error, 1)

	mux := http.NewServeMux()
	mux.HandleFunc("/oauth/callback", func(w http.ResponseWriter, r *http.Request) {
		if err := r.ParseForm(); err != nil {
			errCh <- fmt.Errorf("callback parse: %w", err)
			http.Error(w, "Bad request", http.StatusBadRequest)
			return
		}
		if q := r.URL.Query().Get("error"); q != "" {
			desc := r.URL.Query().Get("error_description")
			errCh <- fmt.Errorf("openrouter auth: %s %s", q, desc)
			http.Error(w, "Authorization failed", http.StatusBadRequest)
			return
		}
		code := r.URL.Query().Get("code")
		if code == "" {
			errCh <- fmt.Errorf("missing authorization code")
			http.Error(w, "Missing code", http.StatusBadRequest)
			return
		}
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		_, _ = io.WriteString(w, `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;padding:2rem;text-align:center;background:#0f172a;color:#e2e8f0"><p>Connected. You can close this tab and return to Moondust.</p></body></html>`)
		codeCh <- code
	})

	srv := &http.Server{
		Handler:      mux,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
	}

	go func() {
		_ = srv.Serve(listener)
	}()

	q := url.Values{}
	q.Set("callback_url", callbackURL)
	q.Set("code_challenge", challenge)
	q.Set("code_challenge_method", "S256")
	auth := authURL + "?" + q.Encode()

	if err := openBrowser(auth); err != nil {
		_ = srv.Close()
		return "", fmt.Errorf("open browser: %w", err)
	}

	waitCtx, cancel := context.WithTimeout(ctx, 15*time.Minute)
	defer cancel()

	var code string
	select {
	case code = <-codeCh:
	case err = <-errCh:
		_ = srv.Close()
		return "", err
	case <-waitCtx.Done():
		_ = srv.Close()
		return "", fmt.Errorf("sign-in timed out; try again")
	}

	shutdownCtx, cancelShut := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancelShut()
	_ = srv.Shutdown(shutdownCtx)

	return exchangeCode(waitCtx, code, verifier)
}

func newCodeVerifier() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(b), nil
}

func codeChallengeS256(verifier string) string {
	sum := sha256.Sum256([]byte(verifier))
	return base64.RawURLEncoding.EncodeToString(sum[:])
}

func exchangeCode(ctx context.Context, code, verifier string) (string, error) {
	body := map[string]string{
		"code":          code,
		"code_verifier": verifier,
	}
	raw, err := json.Marshal(body)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, exchangeURL, bytes.NewReader(raw))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("exchange request: %w", err)
	}
	defer resp.Body.Close()
	respBody, _ := io.ReadAll(resp.Body)

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return "", fmt.Errorf("exchange failed (%s): %s", resp.Status, strings.TrimSpace(string(respBody)))
	}

	var out struct {
		Key string `json:"key"`
	}
	if err := json.Unmarshal(respBody, &out); err != nil {
		return "", fmt.Errorf("decode exchange response: %w", err)
	}
	out.Key = strings.TrimSpace(out.Key)
	if out.Key == "" {
		return "", fmt.Errorf("empty API key in exchange response")
	}
	return out.Key, nil
}
