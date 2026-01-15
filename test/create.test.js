import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "fs-extra";
import { create } from "../src/commands/create.js";

// Correctly mock fs-extra default export
vi.mock("fs-extra", () => {
  return {
    default: {
      ensureDir: vi.fn(),
      writeFile: vi.fn(),
      pathExists: vi.fn(),
    },
  };
});

const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const mockConsoleLog = vi.fn();
const mockConsoleError = vi.fn();

describe("Create Command", () => {
  beforeEach(() => {
    console.log = mockConsoleLog;
    console.error = mockConsoleError;
    vi.clearAllMocks();
    vi.spyOn(process, "exit").mockImplementation(() => {}); // Mock process.exit
    process.env.NODE_ENV = "test";
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    vi.restoreAllMocks(); // Restore mocks including process.exit
  });

  it("should create a skill in non-interactive mode", async () => {
    const options = {
      name: "test-skill",
      platform: "claude",
      description: "Test Description",
      scope: "project",
      nonInteractive: true,
    };

    await create(options);

    expect(fs.ensureDir).toHaveBeenCalledTimes(1);
    expect(fs.writeFile).toHaveBeenCalledTimes(1);
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining("Skill created successfully"),
    );
  });

  it("should fail if required arguments are missing in non-interactive mode", async () => {
    const options = {
      nonInteractive: true,
      // Missing name, platform, description
    };

    await create(options);

    expect(mockConsoleError).toHaveBeenCalledWith(
      expect.stringContaining(
        "Error: --platform, --name, and --description are required",
      ),
    );
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it("should fail if name does not match platform schema", async () => {
    const options = {
      name: "Invalid Name", // Spaces not allowed in Claude
      platform: "claude",
      description: "Test Description",
      scope: "project",
      nonInteractive: true,
    };

    await create(options);

    expect(mockConsoleError).toHaveBeenCalledWith(
      expect.stringContaining("Validation Error"),
    );
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
