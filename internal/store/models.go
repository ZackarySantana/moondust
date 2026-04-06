package store

type Settings struct{}

type Project struct {
	Name      string `json:"name"`
	Directory string `json:"directory"`
	RemoteURL string `json:"remote_url,omitempty"`

	// Meta avoids schema churn in bolt: new features can stash small flags here
	// instead of adding buckets or migration steps.
	Meta map[string]string `json:"meta,omitempty"`
}
