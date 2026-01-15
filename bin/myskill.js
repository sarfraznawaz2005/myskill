#!/usr/bin/env node

import { Command } from "commander";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const packageJson = require("../package.json");

const program = new Command();

program
  .name("myskill")
  .description("CLI tool for creating and managing AI agent skills")
  .version(packageJson.version);

program
  .command("create")
  .description("Create a new skill")
  .option("-n, --name <name>", "Skill name")
  .option(
    "-p, --platform <platform>",
    "Target platform (claude, opencode, codex, gemini)",
  )
  .option("-d, --description <description>", "Skill description")
  .option("-s, --scope <scope>", "Scope (global, project)", "project")
  .option("--non-interactive", "Run without interactive prompts")
  .action(async (options) => {
    const { create } = await import("../src/commands/create.js");
    create(options);
  });

program
  .command("validate")
  .description("Validate a skill")
  .argument("[path]", "Path to skill directory", ".")
  .option("-p, --platform <platform>", "Validate against specific platform")
  .action(async (pathStr, options) => {
    const { validate } = await import("../src/commands/validate.js");
    validate(pathStr, options);
  });

program
  .command("list")
  .description("List installed skills")
  .option("-p, --platform <platform>", "Filter by platform")
  .action(async (options) => {
    const { list } = await import("../src/commands/list.js");
    list(options);
  });

program
  .command("install")
  .description("Install a skill")
  .argument("[path]", "Path to skill directory")
  .option("-p, --platform <platform>", "Target platform")

  .option("-f, --force", "Force overwrite if installed")
  .option("--non-interactive", "Run without interactive prompts")
  .action(async (pathStr, options) => {
    const { install } = await import("../src/commands/install.js");
    install(pathStr, options);
  });

program
  .command("convert")
  .description("Convert a skill to another format")
  .argument("<path>", "Path to source skill")
  .option("-t, --to <platform>", "Target platform")
  .option("-f, --force", "Force overwrite if output exists")
  .option("--non-interactive", "Fail if output exists (unless forced)")
  .action(async (pathStr, options) => {
    const { convert } = await import("../src/commands/convert.js");
    convert(pathStr, options);
  });

program
  .command("find")
  .description("Find skills")
  .argument("[query]", "Search query")
  .option("-p, --platform <platform>", "Filter by platform")
  .action(async (query, options) => {
    const { find } = await import("../src/commands/find.js");
    find(query, options);
  });

program
  .command("uninstall")
  .description("Uninstall a skill")
  .argument("[name]", "Skill name")
  .option("-p, --platform <platform>", "Platform context")
  .option("--non-interactive", "Skip confirmation")
  .action(async (name, options) => {
    const { uninstall } = await import("../src/commands/uninstall.js");
    uninstall(name, options);
  });

program
  .command("config")
  .description("Manage configuration")
  .argument("<action>", "Action: get, set, list")
  .argument("[key]", "Config key (e.g. claude.path)")
  .argument("[value]", "Config value")
  .action(async (action, key, value) => {
    const { config } = await import("../src/commands/config.js");
    config(action, key, value);
  });

program
  .command("pull")
  .description("Pull or clone a skill from a git repository")
  .argument("<repoUrl>", "Repository URL")
  .option("-p, --platform <platform>", "Target platform")
  .option("-n, --name <name>", "Custom skill name")
  .option("--non-interactive", "Skip prompts")
  .action(async (repoUrl, options) => {
    const { pull } = await import("../src/commands/pull.js");
    pull(repoUrl, options);
  });

program
  .command("doctor")
  .description("Check system health and configuration")
  .action(async () => {
    const { doctor } = await import("../src/commands/doctor.js");
    doctor();
  });

program
  .command("run")
  .description("Run a skill script (experimental)")
  .argument("<skill>", "Skill name or path")
  .argument("[args...]", "Arguments to pass to the skill script")
  .action(async (skillName, args) => {
    const { run } = await import("../src/commands/run.js");
    run(skillName, args);
  });

program
  .command("platforms")
  .description("List all supported platforms")
  .action(async () => {
    const { platformsCommand } = await import("../src/commands/platforms.js");
    platformsCommand();
  });

program
  .command("detect")
  .description("Detect skills in directory")
  .argument("[path]", "Path to directory to scan", ".")
  .action(async (pathStr) => {
    const { detect } = await import("../src/commands/detect.js");
    detect(pathStr);
  });

program.parse();
