import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "fs-extra";
import { onboard } from "../src/commands/onboard.js";

vi.mock("fs-extra", () => ({
  default: {
    pathExists: vi.fn(),
    readFile: vi.fn(),
  },
}));

const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const mockConsoleLog = vi.fn();
const mockConsoleError = vi.fn();

describe("Onboard Command", () => {
  beforeEach(() => {
    console.log = mockConsoleLog;
    console.error = mockConsoleError;
    vi.clearAllMocks();
    process.env.NODE_ENV = "test";
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    vi.restoreAllMocks();
  });

  it("should display the content of AGENTS.md", async () => {
    fs.pathExists.mockResolvedValue(true);
    fs.readFile.mockResolvedValue("# Agent Guide\nContent here");

    await onboard();

    expect(mockConsoleLog).toHaveBeenCalledWith("# Agent Guide\nContent here");
  });

  it("should fail if AGENTS.md does not exist", async () => {
    fs.pathExists.mockResolvedValue(false);

    await expect(onboard()).rejects.toThrow("AGENTS_MD_NOT_FOUND");
    expect(mockConsoleError).toHaveBeenCalledWith(
      expect.stringContaining("Error: AGENTS.md not found"),
    );
  });
});
