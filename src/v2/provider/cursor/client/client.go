package client

import "fmt"

type Client struct {
	opts *Options
}

func NewClient(opts ...Option) (*Client, error) {
	options := defaultOptions()
	for _, opt := range opts {
		opt(options)
	}
	client := &Client{opts: options}

	if options.accessToken == "" {
		auth, err := getAccessToken()
		if err != nil {
			return nil, fmt.Errorf("getting cursor access token: %w", err)
		}
		client.opts.accessToken = auth.AccessToken
	}

	return client, nil
}
