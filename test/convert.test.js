import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import { convert } from '../src/commands/convert.js';

vi.mock('fs-extra', () => ({
  default: {
    pathExists: vi.fn(),
    readFile: vi.fn(),
    ensureDir: vi.fn(),
    writeFile: vi.fn(),
    copy: vi.fn(),
    readdir: vi.fn(),
    resolve: (p) => p,
  }
}));

const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const mockConsoleLog = vi.fn();
const mockConsoleError = vi.fn();

describe('Convert Command', () => {
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

  it('should fail in non-interactive mode if target exists and not forced', async () => {
    const sourcePath = '/source/skill';
    
    fs.pathExists.mockImplementation(async (p) => {
        if (p === sourcePath + '/SKILL.md') return true;
        if (p.includes('_opencode')) return true; // Target exists
        return false;
    });
    fs.readFile.mockResolvedValue(`---
name: test
description: desc
---`);

    await convert(sourcePath, { to: 'opencode', nonInteractive: true });

    expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining('Use --force to overwrite'));
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('should succeed if forced', async () => {
    const sourcePath = '/source/skill';
    
    fs.pathExists.mockImplementation(async (p) => {
        if (p === sourcePath + '/SKILL.md') return true;
        if (p.includes('_opencode')) return true; // Target exists
        return false;
    });
    fs.readFile.mockResolvedValue(`---
name: test
description: desc
---`);
    fs.readdir.mockResolvedValue(['SKILL.md']);

    await convert(sourcePath, { to: 'opencode', nonInteractive: true, force: true });

    expect(fs.writeFile).toHaveBeenCalled();
    expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Successfully converted'));
  });
});
