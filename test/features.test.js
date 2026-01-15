import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { doctor } from '../src/commands/doctor.js';
import { run } from '../src/commands/run.js';
import fs from 'fs-extra';
import path from 'path';

// Mock dependencies
vi.mock('fs-extra', () => ({
  default: {
    ensureDir: vi.fn(),
    writeFile: vi.fn(),
    remove: vi.fn(),
    pathExists: vi.fn(),
    readJson: vi.fn(),
  }
}));

vi.mock('simple-git', () => ({
  default: vi.fn(() => ({
    raw: vi.fn().mockResolvedValue('git version 2.x'),
  })),
}));

vi.mock('../src/utils/config.js', () => ({
  getConfig: vi.fn().mockResolvedValue({}),
}));

vi.mock('../src/platforms/index.js', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        getPlatformPath: vi.fn().mockResolvedValue('/mock/path'),
    };
});

vi.mock('inquirer', () => ({
  default: {
    prompt: vi.fn().mockResolvedValue({ name: 'test-workspace', createSkill: false })
  }
}));

// Mock child_process for run command
const mockSpawn = {
    on: vi.fn(),
    stdout: { on: vi.fn() },
    stderr: { on: vi.fn() },
};
vi.mock('child_process', () => ({
    spawn: vi.fn(() => mockSpawn)
}));

const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const mockConsoleLog = vi.fn();
const mockConsoleError = vi.fn();

describe('New Commands', () => {
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

  describe('doctor', () => {
    it('should run checks and report success', async () => {
        await doctor();
        expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('All checks passed'));
    });
  });



  describe('run', () => {
    it('should fail if skill directory not found', async () => {
        fs.pathExists.mockResolvedValue(false);
        await run('non-existent');
        expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining('not found'));
        // run.js continues execution if exit is mocked, leading to undefined entryPoint
        // We need to stop execution flow in test after exit check
        // Or we ensure run.js returns early
    });

    it('should execute script if entry point found', async () => {
        fs.pathExists.mockResolvedValue(true);
        
        await run('./my-skill');
        
        const { spawn } = await import('child_process'); 
        expect(spawn).toHaveBeenCalledWith('node', expect.any(Array), expect.any(Object));
    });
  });
});
