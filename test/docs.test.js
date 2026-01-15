import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { docs } from "../src/commands/docs.js";

const originalConsoleLog = console.log;
const mockConsoleLog = vi.fn();

describe("Docs Command", () => {
  beforeEach(() => {
    console.log = mockConsoleLog;
    vi.clearAllMocks();
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    vi.restoreAllMocks();
  });

  it("should list documentation URLs for all platforms", async () => {
    await docs();

    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining("Platform Documentation"),
    );
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining("Claude Code"),
    );
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining("https://code.claude.com/docs/en/skills"),
    );
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining("OpenCode"),
    );
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining("https://opencode.ai/docs/skills"),
    );
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining("OpenAI Codex"),
    );
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining("https://developers.openai.com/codex/skills"),
    );
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining("Gemini CLI"),
    );
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining("https://geminicli.com/docs/cli/skills"),
    );
  });
});
