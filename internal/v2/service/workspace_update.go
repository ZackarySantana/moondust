package service

import (
	"context"
	"fmt"
	"strings"
)

func (w *Workspace) UpdateDetails(ctx context.Context, id, name, baseBranch string) error {
	wid := strings.TrimSpace(id)
	if wid == "" {
		return fmt.Errorf("workspace id is required")
	}
	n := strings.TrimSpace(name)
	if n == "" {
		return fmt.Errorf("name is required")
	}
	b := strings.TrimSpace(baseBranch)
	if b == "" {
		return fmt.Errorf("base branch is required")
	}
	ws, err := w.stores.Workspace.Get(ctx, []byte(wid))
	if err != nil {
		return err
	}
	ws.Name = n
	ws.Branch = b
	return w.stores.Workspace.Update(ctx, []byte(wid), ws)
}
