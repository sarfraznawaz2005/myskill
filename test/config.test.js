import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import { config as configCmd } from '../src/commands/config.js';
import { getConfig, setConfig } from '../src/utils/config.js';

// Mock fs-extra
vi.mock('fs-extra', () => ({
  default: {
    pathExists: vi.fn(),
    readJson: vi.fn(),
    writeJson: vi.fn(),
    ensureDir: vi.fn(),
  }
}));

const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const mockConsoleLog = vi.fn();
const mockConsoleError = vi.fn();

describe('Config Logic', () => {
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

  it('getConfig returns empty object if file missing', async () => {
    fs.pathExists.mockResolvedValue(false);
    const cfg = await getConfig();
    expect(cfg).toEqual({});
  });

  it('setConfig writes nested value', async () => {
    fs.pathExists.mockResolvedValue(true);
    fs.readJson.mockResolvedValue({});
    
    await setConfig('claude.path', '/tmp/claude');
    
    expect(fs.writeJson).toHaveBeenCalledWith(
        expect.stringContaining('config.json'), 
        expect.objectContaining({ claude: { path: '/tmp/claude' } }),
        expect.any(Object)
    );
  });

  it('config set command calls setConfig', async () => {
    // We implicitly tested utils above, now test command wrapper
    await configCmd('set', 'key', 'value');
    expect(fs.writeJson).toHaveBeenCalled();
    expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Set key = value'));
  });

  it('config get command prints value', async () => {
    fs.pathExists.mockResolvedValue(true);
    fs.readJson.mockResolvedValue({ foo: 'bar' });
    
    await configCmd('get', 'foo');
    expect(mockConsoleLog).toHaveBeenCalledWith('bar');
  });
});
