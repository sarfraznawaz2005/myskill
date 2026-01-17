import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "fs-extra";
import { list } from "../src/commands/list.js";

vi.mock("fs-extra", () => ({
  default: {
    pathExists: vi.fn(),
    readdir: vi.fn(),
    readFile: vi.fn(),
  },
}));

const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const mockConsoleLog = vi.fn();
const mockConsoleError = vi.fn();

describe("List Command", () => {
  beforeEach(() => {
    console.log = mockConsoleLog;
    console.error = mockConsoleError;
    vi.clearAllMocks();
    vi.spyOn(process, "exit").mockImplementation(() => {});
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    vi.restoreAllMocks();
  });

  it("should list skills for a specific platform", async () => {
    fs.pathExists.mockResolvedValue(true);
    fs.readdir.mockResolvedValue([
      { name: "skill-1", isDirectory: () => true },
      { name: "skill-2", isDirectory: () => true },
    ]);
    fs.readFile.mockResolvedValue(`---
name: skill-1
description: Description 1
---`);

    await list({ platform: "claude" });

    expect(mockConsoleLog).toHaveBeenCalledWith("Skill Listing:");
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining("skill-1"),
    );
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining("Claude Code"),
    );
  });

  it("should handle invalid skill format", async () => {
    fs.pathExists.mockResolvedValue(true);
    fs.readdir.mockResolvedValue([
      { name: "broken-skill", isDirectory: () => true },
    ]);
    fs.readFile.mockResolvedValue("invalid content"); // no front matter

    await list({ platform: "claude" });

    // Invalid skills are skipped, so the table should not contain the broken skill
    expect(mockConsoleLog).not.toHaveBeenCalledWith(
      expect.stringContaining("broken-skill"),
    );
    // But Skill Listing: is still logged
    expect(mockConsoleLog).toHaveBeenCalledWith("Skill Listing:");
  });

  it("should fail on unknown platform", async () => {
    await list({ platform: "unknown" });
    expect(mockConsoleError).toHaveBeenCalledWith(
      expect.stringContaining("Unknown platform"),
    );
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
