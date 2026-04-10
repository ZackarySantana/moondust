package notify

import (
	"context"
	"fmt"
)

var _ Channel = (*chain)(nil)
var _ ChannelSetup = (*chain)(nil)
var _ ChannelShutdown = (*chain)(nil)

type Channel interface {
	Send(ctx context.Context, event Event) error
	Kind() Kind
}

type ChannelSetup interface {
	Setup(ctx context.Context)
}

type ChannelShutdown interface {
	Shutdown(ctx context.Context)
}

func Chain(channels ...Channel) *chain {
	return &chain{channels}
}

type chain struct {
	channels []Channel
}

func (c *chain) Send(ctx context.Context, event Event) error {
	kind := event.Kind()
	for _, channel := range c.channels {
		if kind != KindAll && kind != channel.Kind() {
			continue
		}

		if err := channel.Send(ctx, event); err != nil {
			return fmt.Errorf("sending '%s' notification to '%s' channel: %w", kind, channel.Kind(), err)
		}
	}
	return nil
}

func (c *chain) Kind() Kind {
	return KindAll
}

func (c *chain) Setup(ctx context.Context) {
	for _, channel := range c.channels {
		if setup, ok := channel.(ChannelSetup); ok {
			setup.Setup(ctx)
		}
	}
}

func (c *chain) Shutdown(ctx context.Context) {
	for _, channel := range c.channels {
		if shutdown, ok := channel.(ChannelShutdown); ok {
			shutdown.Shutdown(ctx)
		}
	}
}
