package store

type Settings struct{}

type Project struct {
	// ID is an immutable random hex string assigned at creation, used as the bolt key
	// and in URLs so the display name can change freely.
	ID        string `json:"id"`
	Name      string `json:"name"`
	Directory string `json:"directory"`
	RemoteURL string `json:"remote_url,omitempty"`

	// Meta avoids schema churn in bolt: new features can stash small flags here
	// instead of adding buckets or migration steps.
	Meta map[string]string `json:"meta,omitempty"`
}
