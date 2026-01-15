import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "fs-extra";
import path from "path";
import { uninstall } from "../src/commands/uninstall.js";

// Mock inquirer
vi.mock("inquirer", () => ({
  default: {
    prompt: vi.fn(),
  },
}));

vi.mock("fs-extra", () => ({
  default: {
    pathExists: vi.fn(),
    remove: vi.fn(),
  },
}));

vi.mock("../src/platforms/index.js", () => ({
  platforms: {
    claude: { id: "claude", name: "Claude", defaultPath: "/global/claude" },
    opencode: {
      id: "opencode",
      name: "OpenCode",
      defaultPath: "/global/opencode",
    },
    codex: { id: "codex", name: "Codex", defaultPath: "/global/codex" },
    gemini: { id: "gemini", name: "Gemini", defaultPath: "/global/gemini" },
  },
  getPlatform: vi.fn(
    (id) =>
      ({
        claude: { id: "claude", name: "Claude", defaultPath: "/global/claude" },
        opencode: {
          id: "opencode",
          name: "OpenCode",
          defaultPath: "/global/opencode",
        },
        codex: { id: "codex", name: "Codex", defaultPath: "/global/codex" },
        gemini: { id: "gemini", name: "Gemini", defaultPath: "/global/gemini" },
      })[id],
  ),
  getPlatformPath: vi.fn().mockImplementation((id) => `/global/${id}`),
}));

const originalCwd = process.cwd;
// Use path.sep-agnostic mock or normalize inside test
const mockCwd = vi.fn(() => path.join("mock", "cwd"));

const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const mockConsoleLog = vi.fn();
const mockConsoleError = vi.fn();

describe("Uninstall Command", () => {
  beforeEach(() => {
    console.log = mockConsoleLog;
    console.error = mockConsoleError;
    process.cwd = mockCwd;
    vi.clearAllMocks();
    vi.spyOn(process, "exit").mockImplementation(() => {});
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    process.cwd = originalCwd;
    vi.restoreAllMocks();
  });

  it("should uninstall specific skill from platform", async () => {
    const { default: inquirer } = await import("inquirer");
    inquirer.prompt.mockResolvedValue({ confirm: true });

    const skillName = "test-skill";
    const options = { platform: "claude", nonInteractive: true };

    // We expect it to find it in the platform global path
    // Mocks for successful detection
    fs.pathExists.mockImplementation(async (p) => {
      // Normalize slashes for Windows/Linux consistency in matcher
      return p.replace(/\\/g, "/").includes("test-skill");
    });

    await uninstall(skillName, options);

    expect(fs.remove).toHaveBeenCalled();
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining("Successfully removed"),
    );
  });

  it("should fail if skill not found", async () => {
    fs.pathExists.mockResolvedValue(false);

    await uninstall("non-existent");

    expect(mockConsoleError).toHaveBeenCalledWith(
      expect.stringContaining("not found"),
    );
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
