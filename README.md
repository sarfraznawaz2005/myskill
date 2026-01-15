# myskill

> The Universal CLI for AI Agent Skills

`myskill` is a powerful command-line tool designed to standardize the creation, management, and sharing of "Agent Skills" across the modern AI coding ecosystem. It abstracts away the differences between platforms like **Claude Code**, **OpenCode**, **OpenAI Codex**, and **Gemini CLI**, allowing developers to write skills once and deploy them anywhere.

## 🚀 Key Features

- **Unified Creation**: Generate valid, schema-compliant skills for any supported platform.
- **Strict Validation**: Ensure your skills meet platform requirements (YAML frontmatter, file structure).
- **Cross-Platform**: Works seamlessly on Windows, macOS, and Linux.
- **Workspace Management**: Initialize skill workspaces and run experimental skills locally.
- **Discovery**: Fuzzy find installed skills across all global and local scopes.
- **Git Integration**: Pull and update skills directly from remote repositories.
- **Interactive Experience**: Cancel any interactive prompt with **Escape** key or **Ctrl+C**.
- **Configurable Paths**: Override default platform paths for custom setups.

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

Or use flags for automation:

```bash
myskill create \
  --name "git-helper" \
  --platform claude \
  --description "Automates complex git workflows" \
  --scope project \
  --non-interactive
```

### Discovering Skills

List all installed skills for a platform:

```bash
myskill list --platform claude
```

Find a skill by name or description (supports fuzzy search):

```bash
myskill find "deploy"
```

Validate a skill's structure and frontmatter:

```bash
myskill validate ./git-helper
```

Run a skill script (experimental):

```bash
myskill run ./git-helper -- arg1 arg2
```

### Sharing Skills

Install a local skill directory to the global platform path:

```bash
myskill install ./my-local-skill --platform claude
```

Pull (clone/update) a skill from a Git repository:

```bash
myskill pull https://github.com/username/awesome-skill.git --platform opencode
```

Convert a skill from one platform format to another:

```bash
myskill convert ./claude-skill --to opencode
```

Uninstall a skill:

```bash
myskill uninstall git-helper --platform claude
```

### Configuration & Health

Override default paths (useful for custom setups):

```bash
myskill config set claude.path "/custom/path/to/skills"
myskill config list
```

Check system health (Git, permissions, paths):

```bash
myskill doctor
```

## 🔧 Command Reference

| Command     | Description                                                            | Usage                                   | Options                                                                                                                                                                                                                                                                                                                                     |
| ----------- | ---------------------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `create`    | Create a new skill interactively or via flags.                         | `myskill create [options]`              | `-n, --name <name>`: Skill name (lowercase alphanumeric with hyphens)<br>`-p, --platform <platform>`: Target platform (claude, opencode, codex, gemini)<br>`-d, --description <description>`: Skill description<br>`-s, --scope <scope>`: Scope (global, project). Default: project<br>`--non-interactive`: Run without interactive prompts |
| `list`      | List all installed skills for a platform.                              | `myskill list [options]`                | `-p, --platform <platform>`: Filter by platform                                                                                                                                                                                                                                                                                             |
| `platforms` | List all supported platforms.                                          | `myskill platforms`                     | None                                                                                                                                                                                                                                                                                                                                        |
| `detect`    | Detect skills in directory and identify their platforms.               | `myskill detect [path]`                 | `[path]`: Path to directory to scan (default: current directory)                                                                                                                                                                                                                                                                            |
| `find`      | Find skills by name or description with fuzzy search.                  | `myskill find [query] [options]`        | `[query]`: Search query (supports fuzzy matching)<br>`-p, --platform <platform>`: Filter by platform                                                                                                                                                                                                                                        |
| `validate`  | Validate a skill's structure and frontmatter against platform schemas. | `myskill validate [path] [options]`     | `[path]`: Path to skill directory. Default: current directory<br>`-p, --platform <platform>`: Validate against specific platform                                                                                                                                                                                                            |
| `run`       | Run a skill script (experimental).                                     | `myskill run <skill> [args...]`         | `<skill>`: Skill name or path<br>`[args...]`: Arguments to pass to the skill script                                                                                                                                                                                                                                                         |
| `install`   | Install a local skill directory to the global platform path.           | `myskill install <path> [options]`      | `<path>`: Path to skill directory<br>`-p, --platform <platform>`: Target platform<br>`-f, --force`: Force overwrite if already installed<br>`--non-interactive`: Run without interactive prompts                                                                                                                                            |
| `pull`      | Pull (clone/update) a skill from a Git repository.                     | `myskill pull <repoUrl> [options]`      | `<repoUrl>`: Repository URL<br>`-p, --platform <platform>`: Target platform<br>`-n, --name <name>`: Custom skill name<br>`--non-interactive`: Skip prompts                                                                                                                                                                                  |
| `convert`   | Convert a skill from one platform format to another.                   | `myskill convert <path> [options]`      | `<path>`: Path to source skill<br>`-t, --to <platform>`: Target platform<br>`-f, --force`: Force overwrite if output exists<br>`--non-interactive`: Reserved for future interactive features                                                                                                                                                |
| `uninstall` | Uninstall a skill from global or local paths.                          | `myskill uninstall [name] [options]`    | `[name]`: Skill name<br>`-p, --platform <platform>`: Platform context<br>`--non-interactive`: Skip confirmation                                                                                                                                                                                                                             |
| `config`    | Manage configuration settings (e.g., custom paths).                    | `myskill config <action> [key] [value]` | `<action>`: Action (get, set, list)<br>`[key]`: Config key (e.g., claude.path)<br>`[value]`: Config value (for set)                                                                                                                                                                                                                         |
| `doctor`    | Check system health (Git, permissions, paths).                         | `myskill doctor`                        | None                                                                                                                                                                                                                                                                                                                                        |

## 🗺️ Roadmap

- [ ] **Ecosystem & Sharing**: Implement `myskill publish` to upload skills to a central registry (S3, GitHub Packages, or a custom index).
- [ ] **Generate from Prompt**: `myskill create --prompt "A skill that checks AWS S3 buckets"`. Use an LLM API to generate the `SKILL.md` content and initial script code.
