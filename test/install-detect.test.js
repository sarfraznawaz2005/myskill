import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "fs-extra";
import { install } from "../src/commands/install.js";
import { findSkills } from "../src/utils/skills.js";

vi.mock("inquirer", () => ({
  default: {
    prompt: vi.fn(),
  },
}));

vi.mock("fs-extra", () => ({
  default: {
    pathExists: vi.fn(),
    ensureDir: vi.fn(),
    copy: vi.fn(),
    readdir: vi.fn(),
    readFile: vi.fn(),
  },
}));

vi.mock("path", () => ({
  default: {
    resolve: (p) => p,
    basename: (p) => p.split("/").pop(),
    join: (...args) => args.join("/"),
    dirname: (p) => p.split("/").slice(0, -1).join("/"),
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
  getPlatform: vi.fn(),
  getPlatformPath: vi
    .fn()
    .mockImplementation((id) => Promise.resolve(`/global/${id}`)),
}));

vi.mock("../src/utils/skills.js", () => ({
  findSkills: vi.fn(),
  detectPlatform: vi.fn(),
}));

const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const mockConsoleLog = vi.fn();
const mockConsoleError = vi.fn();

describe("Install Command - Auto Detection", () => {
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

  it("should auto-detect and install if only one skill exists", async () => {
    findSkills.mockResolvedValue([
      {
        name: "detected-skill",
        path: "/cwd/detected-skill",
        platform: { id: "claude", name: "Claude" },
        description: "Desc",
      },
    ]);
    fs.pathExists.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    const { default: inquirer } = await import("inquirer");
    inquirer.prompt.mockResolvedValue({ platform: "claude" });

    await install(null, {});

    expect(findSkills).toHaveBeenCalledWith(".");
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining("Detected skill: detected-skill"),
    );
    expect(fs.copy).toHaveBeenCalledWith(
      "/cwd/detected-skill",
      "/global/claude/detected-skill",
      expect.any(Object),
    );
  });

  it("should prompt for selection if multiple skills exist", async () => {
    findSkills.mockResolvedValue([
      {
        name: "skill1",
        path: "/cwd/skill1",
        platform: { id: "claude", name: "Claude" },
      },
      {
        name: "skill2",
        path: "/cwd/skill2",
        platform: { id: "opencode", name: "OpenCode" },
      },
    ]);
    fs.pathExists
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);
    const { default: inquirer } = await import("inquirer");
    inquirer.prompt
      .mockResolvedValueOnce({ selectedSkillPath: "/cwd/skill2" })
      .mockResolvedValueOnce({ platform: "opencode" });

    await install(null, {});

    expect(inquirer.prompt).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          name: "selectedSkillPath",
          type: "list",
        }),
      ]),
    );
    expect(fs.copy).toHaveBeenCalledWith(
      "/cwd/skill2",
      "/global/opencode/skill2",
      expect.any(Object),
    );
  });

  it("should fail if no skills detected", async () => {
    findSkills.mockResolvedValue([]);

    await install(null, {});

    expect(mockConsoleError).toHaveBeenCalledWith(
      expect.stringContaining("No valid skills detected in current directory"),
    );
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
