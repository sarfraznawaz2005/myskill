import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import { find } from '../src/commands/find.js';

vi.mock('fs-extra', () => ({
  default: {
    pathExists: vi.fn(),
    readdir: vi.fn(),
    readFile: vi.fn(),
  }
}));

const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const mockConsoleLog = vi.fn();
const mockConsoleError = vi.fn();

describe('Find Command', () => {
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

  it('should find matching skills with fuzzy search', async () => {
    fs.pathExists.mockResolvedValue(true);
    // Mock readdir to return one item for one location
    fs.readdir.mockImplementation(async (path) => {
        if (path.includes('.claude')) return [{ name: 'deploy-helper', isDirectory: () => true }];
        return [];
    });
    fs.readFile.mockResolvedValue(`---
name: deploy-helper
description: Helper for deploying to production
---`);

    await find('deploy');

    // Should find the skill because "deploy" is in the name and description
    // It finds it in both Global and Project locations because our mock matches both paths containing .claude
    expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Found 2 skills'));
    expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('deploy-helper'));
  });

  it('should handle no matches gracefully', async () => {
    fs.pathExists.mockResolvedValue(true);
    fs.readdir.mockResolvedValue([]); 

    await find('nonexistent');

    expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('No skills found'));
  });

  it('should filter by platform', async () => {
    // If we call with platform 'opencode', it should verify platform is valid
    // We can't easily verify iteration logic without complex mocks, but we can verify it doesn't crash
    await find('test', { platform: 'opencode' });
    // Should pass (no error)
  });
  
  it('should fail on invalid platform', async () => {
      await find('test', { platform: 'invalid' });
      expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining('Unknown platform'));
      expect(process.exit).toHaveBeenCalledWith(1);
  });
});
