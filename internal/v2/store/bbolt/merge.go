package bbolt

import (
	"dario.cat/mergo"
)

func merge[T any](base, update *T) (*T, error) {
	return base, mergo.Merge(base, *update, mergo.WithOverride)
}
