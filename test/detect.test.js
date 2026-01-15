import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "fs-extra";
import path from "path";
import { detect } from "../src/commands/detect.js";

vi.mock("fs-extra", () => ({
  default: {
    readdir: vi.fn(),
    pathExists: vi.fn(),
    readFile: vi.fn(),
  },
}));

vi.mock("path", () => ({
  default: {
    resolve: vi.fn((p) => (p === "." ? "/mock/cwd" : p)),
    join: vi.fn((...args) => args.join("/")),
  },
}));

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
    fs.readdir.mockResolvedValue([
      { name: "claude-skill", isDirectory: () => true },
      { name: "regular-dir", isDirectory: () => true },
    ]);
    fs.pathExists.mockResolvedValue(true);
    fs.readFile.mockResolvedValue(`---
name: claude-skill
description: A Claude skill
allowed-tools: ["Read", "Write"]
---`);

    await detect("test-dir");

    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining("Detecting skills in: test-dir"),
    );
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining("claude-skill: Claude Code (claude)"),
    );
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining("Description: A Claude skill"),
    );
  });

  it("should detect OpenCode skills", async () => {
    fs.readdir.mockResolvedValue([
      { name: "opencode-skill", isDirectory: () => true },
    ]);
    fs.pathExists.mockResolvedValue(true);
    fs.readFile.mockResolvedValue(`---
name: opencode-skill
description: An OpenCode skill
license: MIT
---`);

    await detect("test-dir");

    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining("opencode-skill: OpenCode (opencode)"),
    );
  });

  it("should detect Codex skills", async () => {
    fs.readdir.mockResolvedValue([
      { name: "codex-skill", isDirectory: () => true },
    ]);
    fs.pathExists.mockResolvedValue(true);
    fs.readFile.mockResolvedValue(`---
name: codex-skill
description: A Codex skill
metadata:
  short-description: Short desc
---`);

    await detect("test-dir");

    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining("codex-skill: OpenAI Codex (codex)"),
    );
  });

  it("should default to Gemini for minimal skills", async () => {
    fs.readdir.mockResolvedValue([
      { name: "gemini-skill", isDirectory: () => true },
    ]);
    fs.pathExists.mockResolvedValue(true);
    fs.readFile.mockResolvedValue(`---
name: gemini-skill
description: A Gemini skill
---`);

    await detect("test-dir");

    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining("gemini-skill: Gemini CLI (gemini)"),
    );
  });

  it("should handle no skills found", async () => {
    fs.readdir.mockResolvedValue([
      { name: "regular-dir", isDirectory: () => true },
    ]);
    fs.pathExists.mockResolvedValue(false);

    await detect("test-dir");

    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining("No skills detected"),
    );
  });

  it("should handle invalid frontmatter", async () => {
    fs.readdir.mockResolvedValue([
      { name: "bad-skill", isDirectory: () => true },
    ]);
    fs.pathExists.mockResolvedValue(true);
    fs.readFile.mockResolvedValue("invalid content");

    await detect("test-dir");

    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining("Invalid frontmatter format"),
    );
  });

  it("should handle read errors", async () => {
    fs.readdir.mockResolvedValue([
      { name: "error-skill", isDirectory: () => true },
    ]);
    fs.pathExists.mockResolvedValue(true);
    fs.readFile.mockRejectedValue(new Error("Read error"));

    await detect("test-dir");

    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining("Read error"),
    );
  });
});
