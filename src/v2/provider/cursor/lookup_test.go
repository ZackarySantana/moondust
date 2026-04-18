package cursor_test

import (
	"encoding/json"
	"moondust/src/v2/provider/cursor"
	"moondust/src/v2/run/runtest"
	"os/exec"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestLookUp(t *testing.T) {
	t.Parallel()

	t.Run("NotInstalled", func(t *testing.T) {
		t.Parallel()

		t.Run("ErrNotFound", func(t *testing.T) {
			t.Parallel()

			mock := &runtest.MockExecutor{
				LookPathErrors: []error{exec.ErrNotFound},
			}
			cli := cursor.New(cursor.WithCommandRunner(mock))
			status, err := cli.LookUp(t.Context())
			require.NoError(t, err)
			require.NotNil(t, status)

			assert.False(t, status.Installed)
			assert.False(t, status.Authenticated)
			assert.Empty(t, status.Version)
			assert.Empty(t, status.BinaryPath)
			assert.NotEmpty(t, status.DownloadURL)
		})

		t.Run("ErrOther", func(t *testing.T) {
			t.Parallel()

			mock := &runtest.MockExecutor{}
			cli := cursor.New(cursor.WithCommandRunner(mock))
			status, err := cli.LookUp(t.Context())
			require.ErrorIs(t, err, runtest.ErrIntentionalError)
			require.Nil(t, status)
		})
	})

	t.Run("Installed", func(t *testing.T) {
		t.Parallel()

		t.Run("InvalidVersion", func(t *testing.T) {
			t.Parallel()

			mock := &runtest.MockExecutor{
				LookPathOutputs: []string{"some path"},
			}
			cli := cursor.New(cursor.WithCommandRunner(mock))
			status, err := cli.LookUp(t.Context())
			require.ErrorIs(t, err, runtest.ErrIntentionalError)
			require.Nil(t, status)
		})

		t.Run("InvalidStatus", func(t *testing.T) {
			t.Parallel()

			mock := &runtest.MockExecutor{
				LookPathOutputs: []string{"some path"},
				QuickRunOutputs: [][]byte{[]byte("1.2.3")},
			}
			cli := cursor.New(cursor.WithCommandRunner(mock))
			status, err := cli.LookUp(t.Context())
			require.ErrorIs(t, err, runtest.ErrIntentionalError)
			require.Nil(t, status)
		})

		t.Run("Valid", func(t *testing.T) {
			t.Parallel()

			validStatus := cursor.StatusCommandOutput{
				IsAuthenticated: true,
			}
			validStatusJSON, err := json.Marshal(validStatus)
			require.NoError(t, err)

			mock := &runtest.MockExecutor{
				LookPathOutputs: []string{"some path"},
				QuickRunOutputs: [][]byte{[]byte("1.2.3"), validStatusJSON},
			}
			cli := cursor.New(cursor.WithCommandRunner(mock))
			status, err := cli.LookUp(t.Context())
			require.NoError(t, err)
			require.NotNil(t, status)

			assert.True(t, status.Installed)
			assert.True(t, status.Authenticated)
			assert.Equal(t, "1.2.3", status.Version)
			assert.Equal(t, "some path", status.BinaryPath)
			assert.NotEmpty(t, status.DownloadURL)
		})
	})
}
