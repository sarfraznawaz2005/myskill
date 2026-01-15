import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "fs-extra";
import path from "path";
import { detect } from "../src/commands/detect.js";
import { findSkills } from "../src/utils/skills.js";

vi.mock("fs-extra", () => ({
  default: {
    readdir: vi.fn(),
    pathExists: vi.fn(),
    readFile: vi.fn(),
  },
}));

vi.mock("../src/utils/skills.js", async () => {
  const actual = await vi.importActual("../src/utils/skills.js");
  return {
    ...actual,
    findSkills: vi.fn(),
  };
});

const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const mockConsoleLog = vi.fn();
const mockConsoleError = vi.fn();
describe("Detect Command", () => {
  beforeEach(() => {
    console.log = mockConsoleLog;
    console.error = mockConsoleError;
    vi.clearAllMocks();
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    vi.restoreAllMocks();
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    vi.restoreAllMocks();
  });

  it("should detect Claude skills", async () => {
    findSkills.mockResolvedValue([
      {
        name: "claude-skill",
        platform: { id: "claude", name: "Claude Code" },
        description: "A Claude skill",
      },
    ]);

    await detect("test-dir");

    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining("Detecting skills in:"),
    );
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining("test-dir"),
    );
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining("claude-skill: Claude Code (claude)"),
    );
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining("Description: A Claude skill"),
    );
  });

  it("should detect OpenCode skills", async () => {
    findSkills.mockResolvedValue([
      {
        name: "opencode-skill",
        platform: { id: "opencode", name: "OpenCode" },
        description: "An OpenCode skill",
      },
    ]);

    await detect("test-dir");

    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining("opencode-skill: OpenCode (opencode)"),
    );
  });

  it("should detect Codex skills", async () => {
    findSkills.mockResolvedValue([
      {
        name: "codex-skill",
        platform: { id: "codex", name: "OpenAI Codex" },
        description: "A Codex skill",
      },
    ]);

    await detect("test-dir");

    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining("codex-skill: OpenAI Codex (codex)"),
    );
  });

  it("should default to Gemini for minimal skills", async () => {
    findSkills.mockResolvedValue([
      {
        name: "gemini-skill",
        platform: { id: "gemini", name: "Gemini CLI" },
        description: "A Gemini skill",
      },
    ]);

    await detect("test-dir");

    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining("gemini-skill: Gemini CLI (gemini)"),
    );
  });

  it("should handle no skills found", async () => {
    findSkills.mockResolvedValue([]);

    await detect("test-dir");

    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining("No skills detected"),
    );
  });

  it("should handle invalid frontmatter", async () => {
    findSkills.mockResolvedValue([
      {
        name: "bad-skill",
        error: "Invalid frontmatter format",
      },
    ]);

    await detect("test-dir");

    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining("Invalid frontmatter format"),
    );
  });

  it("should handle read errors", async () => {
    findSkills.mockResolvedValue([
      {
        name: "error-skill",
        error: "Read error",
      },
    ]);

    await detect("test-dir");

    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining("Read error"),
    );
  });

  it("should detect skills in platform-specific folders", async () => {
    findSkills
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          name: "claude-skill",
          path: "test-dir/.claude/skills/claude-skill",
          platform: { id: "claude", name: "Claude Code" },
          description: "Claude skill in hidden folder",
        },
      ])
      .mockResolvedValue([]);

    fs.pathExists.mockImplementation(async (p) => {
      return p.includes(".claude");
    });

    await detect("test-dir");

    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining("claude-skill: Claude Code (claude)"),
    );
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringMatching(/Path: .claude[\\\/]skills[\\\/]claude-skill/),
    );
  });
});
