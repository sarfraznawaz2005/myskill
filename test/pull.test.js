import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import { pull } from '../src/commands/pull.js';

vi.mock('fs-extra', () => ({
  default: {
    pathExists: vi.fn(),
    ensureDir: vi.fn(),
    readJson: vi.fn(),
  }
}));

vi.mock('../src/utils/config.js', () => ({
    getConfig: vi.fn().mockResolvedValue({})
}));

vi.mock('../src/platforms/index.js', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        getPlatformPath: vi.fn().mockResolvedValue('/mock/platform/path'),
        getPlatform: vi.fn().mockReturnValue({
            id: 'claude',
            name: 'Claude Code',
            defaultPath: '/mock/platform/path'
        })
    };
});

// Mock simple-git
const mockGit = {
  clone: vi.fn().mockResolvedValue(),
  cwd: vi.fn().mockReturnThis(),
  pull: vi.fn().mockResolvedValue(),
  raw: vi.fn().mockResolvedValue('git version 2.x'),
};

vi.mock('simple-git', () => {
  return {
    default: vi.fn(() => mockGit)
  };
});

const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const mockConsoleLog = vi.fn();
const mockConsoleError = vi.fn();

describe('Pull Command', () => {
  beforeEach(() => {
    console.log = mockConsoleLog;
    console.error = mockConsoleError;
    vi.clearAllMocks();
    vi.spyOn(process, 'exit').mockImplementation(() => {});
    mockGit.raw.mockResolvedValue('git version');
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    vi.restoreAllMocks();
  });

  it('should fail if git is not installed', async () => {
    mockGit.raw.mockRejectedValue(new Error('git not found'));
    
    // We expect it to THROW now because bin/myskill.js wrapper catches it.
    // However, if pull.js still has process.exit, it will exit.
    // The previous edit to pull.js ADDED a throw for git check.
    
    await expect(pull('https://github.com/user/skill.git', { 
        platform: 'claude', 
        nonInteractive: true 
    })).rejects.toThrow('Git is not installed');
  });

  it('should clone if directory does not exist', async () => {
    fs.pathExists.mockResolvedValue(false);
    
    await pull('https://github.com/user/skill.git', { 
        platform: 'claude', 
        nonInteractive: true 
    });

    expect(fs.ensureDir).toHaveBeenCalled();
    expect(mockGit.clone).toHaveBeenCalled();
    expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Successfully cloned'));
  });

  it('should pull if directory exists', async () => {
    fs.pathExists.mockResolvedValue(true);

    await pull('https://github.com/user/skill.git', { 
        platform: 'claude',
        nonInteractive: true 
    });

    expect(mockGit.pull).toHaveBeenCalled();
    expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Successfully updated'));
  });
});
