import { describe, expect, test } from "vitest";
import {
    CLAUDE_LOGIN_COMMAND,
    friendlyClaudeAuthErrorMessage,
} from "./claude-auth-display";

describe("friendlyClaudeAuthErrorMessage", () => {
    test("rewrites logged-out JSON from claude auth status", () => {
        const raw = `{"loggedIn":false,"authMethod":"none","apiProvider":"firstParty"}`;
        expect(friendlyClaudeAuthErrorMessage(raw)).toBe(
            `Not signed in. Run ${CLAUDE_LOGIN_COMMAND} in a terminal.`,
        );
    });

    test("passes through non-JSON errors", () => {
        expect(
            friendlyClaudeAuthErrorMessage("exit status 1: no network"),
        ).toBe("exit status 1: no network");
    });
});
