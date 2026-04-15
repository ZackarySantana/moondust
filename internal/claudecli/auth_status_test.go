package claudecli

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestParseClaudeAuthStatusJSON(t *testing.T) {
	t.Parallel()
	raw := `{
  "loggedIn": true,
  "authMethod": "claude.ai",
  "apiProvider": "firstParty",
  "email": "a@b.co",
  "orgId": "org-1",
  "orgName": "My Org",
  "subscriptionType": "pro"
}`
	got, err := parseClaudeAuthStatusJSON([]byte(raw))
	require.NoError(t, err)
	require.NotNil(t, got)
	assert.True(t, got.LoggedIn)
	assert.Equal(t, "claude.ai", got.AuthMethod)
	assert.Equal(t, "firstParty", got.APIProvider)
	assert.Equal(t, "a@b.co", got.Email)
	assert.Equal(t, "org-1", got.OrgID)
	assert.Equal(t, "My Org", got.OrgName)
	assert.Equal(t, "pro", got.SubscriptionType)
}
