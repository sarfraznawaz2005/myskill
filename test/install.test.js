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

// Mock platforms
vi.mock("../src/platforms/index.js", () => ({
  platforms: {
    claude: { id: "claude", name: "Claude", defaultPath: "/global/claude" },
  },
  getPlatform: vi.fn(),
  getPlatformPath: vi.fn().mockResolvedValue("/global/claude"),
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
});
