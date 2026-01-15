import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import { validate } from '../src/commands/validate.js';

vi.mock('fs-extra', () => {
  return {
    default: {
      pathExists: vi.fn(),
      readFile: vi.fn(),
      // We don't mock resolve here as it's not on the default export usually, but path.resolve is native.
      // validate.js uses path.resolve(targetPath).
      // If we want to test path logic, we might need to rely on real path.resolve behavior or mock path module.
      // However, fs-extra usually re-exports fs methods.
    }
  };
});

// Since validate uses path.resolve, and we passed a dummy path, path.resolve might return absolute path on current OS.
// That's fine as long as fs.pathExists returns true for it.

const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const mockConsoleLog = vi.fn();
const mockConsoleError = vi.fn();

describe('Validate Command', () => {
  beforeEach(() => {
    console.log = mockConsoleLog;
    console.error = mockConsoleError;
    vi.clearAllMocks();
    vi.spyOn(process, 'exit').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    vi.restoreAllMocks();
  });

  it('should pass validation for a valid skill', async () => {
    // Determine the expected absolute path to check against dirName
    // We can't easily mock path.basename unless we mock 'path' module
    // But we can construct a path that ends in valid-skill
    const testPath = '/tmp/valid-skill';

    fs.pathExists.mockResolvedValue(true);
    fs.readFile.mockResolvedValue(`---
name: valid-skill
description: Test description
---
`);

    await validate(testPath);

    expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Valid'));
  });

  it('should fail validation for invalid YAML', async () => {
    fs.pathExists.mockResolvedValue(true);
    fs.readFile.mockResolvedValue(`---
name: broken-yaml
description: "Missing quote
---
`);

    await validate('/path/to/broken-yaml');

    expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining('YAML parsing failed'));
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
