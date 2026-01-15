# myskill

> The Universal CLI for AI Agent Skills

`myskill` is a powerful command-line tool designed to standardize the creation, management, and sharing of "Agent Skills" across the modern AI coding ecosystem. It abstracts away the differences between platforms like **Claude Code**, **OpenCode**, **OpenAI Codex**, and **Gemini CLI**, allowing developers to write skills once and deploy them anywhere.

## 🚀 Key Features

- **Unified Creation**: Generate valid, schema-compliant skills for any supported platform.
- **Strict Validation**: Ensure your skills meet platform requirements (YAML frontmatter, file structure).
- **Cross-Platform**: Works seamlessly on Windows, macOS, and Linux.
- **Workspace Management**: Initialize skill workspaces and run experimental skills locally.
- **Discovery**: Fuzzy find installed skills across all global and local scopes.
- **Smart Detection**: Automatically identify skills in any directory, including nested platform-specific folders.
- **Git Integration**: Pull and update skills directly from remote repositories.
- **Interactive Experience**: Step-by-step guides with **Multi-selection** support for bulk actions.
- **Configurable Paths**: Override default platform paths for custom setups.
- **Onboarding**: Built-in guide for AI agents to understand the codebase.

## 📦 Installation

```bash
npm install -g myskill
```

## 🛠️ Supported Platforms

| Platform         | ID         | Key Features Supported                    |
| :--------------- | :--------- | :---------------------------------------- |
| **Claude Code**  | `claude`   | `allowed-tools`, `context: fork`, `hooks` |
| **OpenCode**     | `opencode` | `license`, `compatibility`, `metadata`    |
| **OpenAI Codex** | `codex`    | `short-description` metadata              |
| **Gemini CLI**   | `gemini`   | Standard skill structure                  |

## 📖 Usage Guide

### Creating Skills

Create a new skill interactively:

```bash
myskill create
# Cancel anytime with Escape key or Ctrl+C
```

### Discovering Skills

Detect skills in the current directory and platform-specific subfolders:

```bash
myskill detect
```

List all installed skills for a platform:

```bash
myskill list --platform claude
```

### Sharing Skills

Install a local skill directory to the global platform path (supports auto-detection and interactive selection):

```bash
myskill install
```

Uninstall skills with **multi-selection** support:

```bash
myskill uninstall
```

### Configuration & Help

List documentation URLs for all platforms:

```bash
myskill docs
```

Display onboarding guide for AI agents:

```bash
myskill onboard
```

Override default paths:

```bash
myskill config set claude.path "/custom/path/to/skills"
myskill config list
```

## 🔧 Command Reference

| Command     | Description                                                            | Usage                                   | Options                                                                                                                                                                                                                                                             |
| ----------- | ---------------------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `create`    | Create a new skill interactively or via flags.                         | `myskill create [options]`              | `-n, --name <name>`: Skill name<br>`-p, --platform <platform>`: Target platform<br>`-d, --description <description>`: Skill description<br>`-s, --scope <scope>`: Scope (global, project). Default: project<br>`--non-interactive`: Run without interactive prompts |
| `list`      | List all installed skills for a platform.                              | `myskill list [options]`                | `-p, --platform <platform>`: Filter by platform                                                                                                                                                                                                                     |
| `platforms` | List all supported platforms.                                          | `myskill platforms`                     | None                                                                                                                                                                                                                                                                |
| `detect`    | Detect skills in directory and platform folders.                       | `myskill detect [path]`                 | `[path]`: Path to directory to scan (default: current directory)                                                                                                                                                                                                    |
| `docs`      | List documentation URLs for all platforms.                             | `myskill docs`                          | None                                                                                                                                                                                                                                                                |
| `onboard`   | Display onboarding guide for AI agents.                                | `myskill onboard`                       | None                                                                                                                                                                                                                                                                |
| `find`      | Find skills by name or description with fuzzy search.                  | `myskill find [query] [options]`        | `[query]`: Search query<br>`-p, --platform <platform>`: Filter by platform                                                                                                                                                                                          |
| `validate`  | Validate a skill's structure and frontmatter against platform schemas. | `myskill validate [path] [options]`     | `[path]`: Path to skill directory. Default: current directory<br>`-p, --platform <platform>`: Validate against specific platform                                                                                                                                    |
| `run`       | Run a skill script (experimental).                                     | `myskill run <skill> [args...]`         | `<skill>`: Skill name or path<br>`[args...]`: Arguments to pass to the skill script                                                                                                                                                                                 |
| `install`   | Install a local skill to the global platform path.                     | `myskill install [path] [options]`      | `[path]`: Path to skill directory (optional - auto-detects if omitted)<br>`-p, --platform <platform>`: Target platform<br>`-f, --force`: Force overwrite<br>`--non-interactive`: Run without prompts                                                                |
| `pull`      | Pull (clone/update) a skill from a Git repository.                     | `myskill pull <repoUrl> [options]`      | `<repoUrl>`: Repository URL<br>`-p, --platform <platform>`: Target platform<br>`-n, --name <name>`: Custom skill name<br>`--non-interactive`: Skip prompts                                                                                                          |
| `convert`   | Convert a skill from one platform format to another.                   | `myskill convert <path> [options]`      | `<path>`: Path to source skill<br>`-t, --to <platform>`: Target platform<br>`-f, --force`: Force overwrite<br>`--non-interactive`: Fail if output exists                                                                                                            |
| `uninstall` | Uninstall one or more skills from global or local paths.               | `myskill uninstall [name] [options]`    | `[name]`: Skill name (optional - triggers multi-select if omitted)<br>`-p, --platform <platform>`: Platform context<br>`--non-interactive`: Skip confirmation                                                                                                       |
| `config`    | Manage configuration settings (e.g., custom paths).                    | `myskill config <action> [key] [value]` | `<action>`: Action (get, set, list)<br>`[key]`: Config key (e.g., claude.path)<br>`[value]`: Config value (for set)                                                                                                                                                 |
| `doctor`    | Check system health (Git, permissions, paths).                         | `myskill doctor`                        | None                                                                                                                                                                                                                                                                |

## 🗺️ Roadmap

- [ ] **Ecosystem & Sharing**: Implement `myskill publish` to upload skills to a central registry (S3, GitHub Packages, or a custom index).
- [ ] **Generate from Prompt**: `myskill create --prompt "A skill that checks AWS S3 buckets"`. Use an LLM API to generate the `SKILL.md` content and initial script code.
