package terminal

import (
	"net/http"
	"strings"

	"github.com/coder/websocket"
)

func (s *Server) handleTerminal(w http.ResponseWriter, r *http.Request) {
	if r.URL.Query().Get("token") != s.token {
		http.Error(w, "forbidden", http.StatusForbidden)
		return
	}

	c, err := websocket.Accept(w, r, &websocket.AcceptOptions{
		InsecureSkipVerify: true,
	})
	if err != nil {
		return
	}
	defer c.Close(websocket.StatusNormalClosure, "")

	ctx := r.Context()
	sessionID := strings.TrimSpace(r.URL.Query().Get("session"))
	if sessionID == "" {
		sessionID = "default"
	}
	s.attach(ctx, c, sessionID, r.URL.Query().Get("cwd"))
}
