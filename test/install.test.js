import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "fs-extra";
import { install } from "../src/commands/install.js";

// Mock inquirer
vi.mock("inquirer", () => ({
  default: {
    prompt: vi.fn().mockResolvedValue({ overwrite: true, platform: "claude" }),
  },
}));

vi.mock("fs-extra", () => ({
  default: {
    pathExists: vi.fn(),
    ensureDir: vi.fn(),
    copy: vi.fn(),
    resolve: (p) => p,
  },
}));

vi.mock("path", () => ({
  default: {
    resolve: (p) => p,
    basename: (p) => p.split("/").pop(),
    join: (...args) => args.join("/"),
  },
}));

// Mock platforms
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
  getPlatform: vi.fn(),
  getPlatformPath: vi
    .fn()
    .mockImplementation((id) => Promise.resolve(`/global/${id}`)),
}));

const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const mockConsoleLog = vi.fn();
const mockConsoleError = vi.fn();

describe("Install Command", () => {
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

  it("should fail in non-interactive mode if overwrite is needed but not forced", async () => {
    fs.pathExists.mockResolvedValue(true); // Exists

    await install("/source/skill", {
      platform: "claude",
      nonInteractive: true,
    });

    expect(mockConsoleError).toHaveBeenCalledWith(
      expect.stringContaining("Use --force to overwrite"),
    );
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it("should succeed in non-interactive mode if forced", async () => {
    fs.pathExists.mockResolvedValue(true); // Exists

    await install("/source/skill", {
      platform: "claude",
      nonInteractive: true,
      force: true,
    });

    expect(fs.copy).toHaveBeenCalled();
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining("Successfully installed"),
    );
  });

  it("should install to all platforms when ALL is selected in interactive mode", async () => {
    // Mock inquirer to return "all"
    const { default: inquirer } = await import("inquirer");
    inquirer.prompt.mockResolvedValue({ platform: "all" });

    fs.pathExists.mockResolvedValue(false); // Doesn't exist

    await install("/source/skill", {});

    // Should call copy for each platform
    expect(fs.copy).toHaveBeenCalledTimes(4);
    expect(fs.copy).toHaveBeenCalledWith(
      "/source/skill",
      "/global/claude/skill",
      expect.any(Object),
    );
    expect(fs.copy).toHaveBeenCalledWith(
      "/source/skill",
      "/global/opencode/skill",
      expect.any(Object),
    );
    expect(fs.copy).toHaveBeenCalledWith(
      "/source/skill",
      "/global/codex/skill",
      expect.any(Object),
    );
    expect(fs.copy).toHaveBeenCalledWith(
      "/source/skill",
      "/global/gemini/skill",
      expect.any(Object),
    );

    // Should log success for each
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining(
        "Successfully installed 'skill' to /global/claude/skill (Claude)",
      ),
    );
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining(
        "Successfully installed 'skill' to /global/opencode/skill (OpenCode)",
      ),
    );
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining(
        "Successfully installed 'skill' to /global/codex/skill (Codex)",
      ),
    );
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining(
        "Successfully installed 'skill' to /global/gemini/skill (Gemini)",
      ),
    );
  });
});
