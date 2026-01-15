# Agent Guide for `myskill`

This document is designed to help AI agents (and human developers) understand the architecture, conventions, and workflows of the `myskill` project.

## 1. Project Overview
`myskill` is a CLI tool built in **Node.js** to unify the creation and management of "Agent Skills" across different AI coding platforms (Claude Code, OpenCode, OpenAI Codex, Gemini CLI).

**Core Mission**: Abstract away the differences in YAML frontmatter, directory structures, and configuration files between different AI tools.

## 2. Tech Stack
- **Runtime**: Node.js (ES Modules)
- **CLI Framework**: `commander`
- **Interactivity**: `inquirer`
- **Validation**: `zod` (Strict schema validation is a core tenet)
- **File System**: `fs-extra`
- **Search**: `fuse.js`
- **Git Integration**: `simple-git`
- **Path Management**: `env-paths` (for cross-platform config locations)
- **Formatting**: `prettier` (for generated code)
- **Testing**: `vitest`

## 3. Architecture

### Directory Structure
```text
myskill/
├── bin/
│   └── myskill.js        # CLI Entry point & Command Registration
├── src/
│   ├── commands/         # Individual command logic
│   │   ├── create.js     # Logic for 'myskill create'
│   │   ├── validate.js   # Logic for 'myskill validate'
│   │   └── ...           # All command implementations
│   ├── platforms/        # Platform Definitions (The "Brain")
│   │   ├── index.js      # Exports all platforms and getPlatformPath
│   │   ├── claude.js     # Claude Code specific config & schema
│   │   └── ...
│   ├── templates/        # File generation templates (generateSkill.js)
│   └── utils/            # Shared utilities (config.js)
└── test/                 # Unit and Integration tests
```

### Key Concepts

#### Platform Definitions (`src/platforms/*.js`)
Every supported tool (e.g., Claude, OpenCode) is defined as a module exporting:
1.  **`id`**: Internal key.
2.  **`name`**: Display name.
3.  **`defaultPath`**: Default location where skills live globally on the OS (fallback, now configurable).
4.  **`schema`**: A **Zod** schema defining valid frontmatter fields.
5.  **`prompts`**: Inquirer prompt definitions for platform-specific fields.

#### Command Pattern
Commands are defined in `bin/myskill.js` but implemented in `src/commands/*.js`.
- **Dependency Injection**: Commands should lazily import logic to keep startup fast.
- **Interactivity**: Commands must support both interactive (Prompts) and non-interactive (Flags) modes.
- **Error Handling**: Commands throw errors; `bin/myskill.js` catches and handles them.

#### Configuration System (`src/utils/config.js`)
- Uses `env-paths` for cross-platform config directories (e.g., `~/.config/myskill` on Linux/Mac, `%APPDATA%\myskill` on Windows).
- Platform paths can be overridden via `myskill config set claude.path "/custom/path"`.
- `getPlatformPath()` in `platforms/index.js` checks config first, falls back to default.

#### Current Commands
- `create`: Generate new skills
- `validate`: Check skill validity
- `list`: List installed skills
- `find`: Fuzzy search skills
- `install`: Install local skills to global paths
- `pull`: Clone/pull skills from Git repos
- `convert`: Convert skills between platforms
- `uninstall`: Remove skills
- `run`: Execute skill scripts (experimental)
- `config`: Manage configuration
- `doctor`: System health check

## 4. Development Guidelines

### Adding a New Platform
To add support for a new tool (e.g., "SuperAI"):
1.  Create `src/platforms/superai.js`.
2.  Define its Zod schema and default paths.
3.  Export it in `src/platforms/index.js`.
4.  Add unit tests in `test/schemas.test.js`.

### Adding a New Command
1.  Create `src/commands/mycommand.js`.
2.  Register it in `bin/myskill.js`.
3.  Ensure it handles `options` for non-interactive usage and throws errors appropriately.
4.  Add tests in `test/mycommand.test.js`.

### Testing Rules
- **Run Tests**: `npm test` (uses Vitest).
- **Mocking**: Use `vi.mock` for `fs-extra`, `inquirer`, `simple-git`, and other I/O libraries to avoid file system side effects during unit tests.
- **Coverage**: Ensure both success paths and error paths (e.g., invalid YAML, missing files) are tested.
- **Cross-Platform**: Tests should work on Windows/Linux/macOS; use `path.join` in mocks.

## 5. Common Pitfalls
- **ESM**: This project uses `"type": "module"`. Use `import/export`, not `require` (unless constructing a `require` via `module`).
- **Paths**: Always use `path.join` or `path.resolve` for cross-platform compatibility (Windows/Linux/macOS). Config paths use `env-paths`.
- **Zod Strictness**: When defining schemas, be precise. `myskill validate` relies on these schemas to catch user errors.
- **Error Propagation**: Commands should throw errors, not call `process.exit`. Let the CLI entry point handle exits.