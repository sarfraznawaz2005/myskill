import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { platformsCommand } from "../src/commands/platforms.js";

const originalConsoleLog = console.log;
const mockConsoleLog = vi.fn();

describe("Platforms Command", () => {
  beforeEach(() => {
    console.log = mockConsoleLog;
    vi.clearAllMocks();
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    vi.restoreAllMocks();
  });

  it("should list all available platforms", async () => {
    await platformsCommand();

    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining("Available Platforms"),
    );
    expect(mockConsoleLog).toHaveBeenCalledWith("claude: Claude Code");
    expect(mockConsoleLog).toHaveBeenCalledWith("opencode: OpenCode");
    expect(mockConsoleLog).toHaveBeenCalledWith("codex: OpenAI Codex");
    expect(mockConsoleLog).toHaveBeenCalledWith("gemini: Gemini CLI");
  });
});
