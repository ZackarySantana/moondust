package runtest

import (
	"context"
	"errors"
	"io"
	"moondust/src/v2/run"
)

var ErrIntentionalError = errors.New("intentional error")

var _ run.Executor = (*MockExecutor)(nil)

type MockExecutor struct {
	LookPathOutputs    []string
	LookPathErrors     []error
	lookPathIndex      int
	lookPathErrorIndex int

	QuickRunOutputs    [][]byte
	QuickRunErrors     []error
	quickRunIndex      int
	quickRunErrorIndex int

	RunOutputs    [][]io.ReadCloser
	RunErrors     []error
	runIndex      int
	runErrorIndex int
}

func (m *MockExecutor) LookPath(ctx context.Context, binaryName string) (string, error) {
	if m.lookPathIndex >= len(m.LookPathOutputs) {
		if m.lookPathErrorIndex >= len(m.LookPathErrors) {
			return "", ErrIntentionalError
		}
		error := m.LookPathErrors[m.lookPathErrorIndex]
		m.lookPathErrorIndex++
		return "", error
	}
	output := m.LookPathOutputs[m.lookPathIndex]
	m.lookPathIndex++
	return output, nil
}

func (m *MockExecutor) QuickRun(ctx context.Context, path string, args ...string) ([]byte, error) {
	if m.quickRunIndex >= len(m.QuickRunOutputs) {
		if m.quickRunErrorIndex >= len(m.QuickRunErrors) {
			return nil, ErrIntentionalError
		}
		error := m.QuickRunErrors[m.quickRunErrorIndex]
		m.quickRunErrorIndex++
		return nil, error
	}
	output := m.QuickRunOutputs[m.quickRunIndex]
	m.quickRunIndex++
	return output, nil
}

func (m *MockExecutor) Run(ctx context.Context, path string, args ...string) (io.ReadCloser, io.ReadCloser, error) {
	if m.runIndex >= len(m.RunOutputs) {
		if m.runErrorIndex >= len(m.RunErrors) {
			return nil, nil, ErrIntentionalError
		}
		error := m.RunErrors[m.runErrorIndex]
		m.runErrorIndex++
		return nil, nil, error
	}
	outputs := m.RunOutputs[m.runIndex]
	m.runIndex++
	return outputs[0], outputs[1], nil
}
