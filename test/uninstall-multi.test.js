import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "fs-extra";
import { uninstall } from "../src/commands/uninstall.js";
import { getAllInstalledSkills } from "../src/utils/skills.js";

vi.mock("inquirer", () => ({
  default: {
    prompt: vi.fn(),
  },
}));

vi.mock("fs-extra", () => ({
  default: {
    pathExists: vi.fn(),
    remove: vi.fn(),
    readdir: vi.fn(),
    readFile: vi.fn(),
  },
}));

vi.mock("../src/platforms/index.js", () => ({
  platforms: {
    claude: { id: "claude", name: "Claude" },
    opencode: { id: "opencode", name: "OpenCode" },
  },
  getPlatform: vi.fn(),
  getPlatformPath: vi.fn(),
}));

vi.mock("../src/utils/skills.js", () => ({
  getAllInstalledSkills: vi.fn(),
  detectPlatform: vi.fn(),
  findSkills: vi.fn(),
}));

const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const mockConsoleLog = vi.fn();
const mockConsoleError = vi.fn();

describe("Uninstall Command - Multi Selection", () => {
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

  it("should prompt for multi-selection when no name is provided", async () => {
    getAllInstalledSkills.mockResolvedValue([
      {
        name: "skill1",
        path: "/path/to/skill1",
        platform: { id: "claude", name: "Claude" },
        location: "Global",
        description: "Desc 1",
      },
      {
        name: "skill2",
        path: "/path/to/skill2",
        platform: { id: "opencode", name: "OpenCode" },
        location: "Project",
        description: "Desc 2",
      },
    ]);

    const { default: inquirer } = await import("inquirer");
    inquirer.prompt
      .mockResolvedValueOnce({
        selectedSkills: ["/path/to/skill1", "/path/to/skill2"],
      })
      .mockResolvedValueOnce({ confirm: true });

    await uninstall(null, {});

    expect(getAllInstalledSkills).toHaveBeenCalled();
    expect(inquirer.prompt).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          type: "checkbox",
          name: "selectedSkills",
        }),
      ]),
    );
    expect(fs.remove).toHaveBeenCalledTimes(2);
    expect(fs.remove).toHaveBeenCalledWith("/path/to/skill1");
    expect(fs.remove).toHaveBeenCalledWith("/path/to/skill2");
  });

  it("should fail if no skills are installed", async () => {
    getAllInstalledSkills.mockResolvedValue([]);

    await uninstall(null, {});

    expect(mockConsoleError).toHaveBeenCalledWith(
      expect.stringContaining("No installed skills found"),
    );
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
