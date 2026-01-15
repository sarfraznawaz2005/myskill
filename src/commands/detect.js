import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import yaml from "js-yaml";
import { platforms } from "../platforms/index.js";

export async function detect(pathStr = ".", options = {}) {
  const targetDir = pathStr === "." ? process.cwd() : path.resolve(pathStr);

  console.log(chalk.blue(`Detecting skills in: ${targetDir}\n`));

  try {
    const items = await fs.readdir(targetDir, { withFileTypes: true });
    const skillDirs = [];

    for (const item of items) {
      if (item.isDirectory()) {
        const skillPath = path.join(targetDir, item.name, "SKILL.md");
        if (await fs.pathExists(skillPath)) {
          skillDirs.push(item.name);
        }
      }
    }

    if (skillDirs.length === 0) {
      console.log(chalk.yellow("No skills detected in current directory."));
      return;
    }

    for (const dirName of skillDirs) {
      const skillPath = path.join(targetDir, dirName, "SKILL.md");

      try {
        const content = await fs.readFile(skillPath, "utf8");
        const match = content.match(/^---\n([\s\S]*?)\n---/);

        if (match) {
          const fm = yaml.load(match[1]);
          const detectedPlatform = detectPlatform(fm);

          console.log(
            `${chalk.bold(dirName)}: ${chalk.green(detectedPlatform.name)} (${detectedPlatform.id})`,
          );
          console.log(`  Description: ${fm.description || "No description"}`);
        } else {
          console.log(
            `${chalk.bold(dirName)}: ${chalk.red("Invalid frontmatter format")}`,
          );
        }
      } catch (e) {
        console.log(`${chalk.bold(dirName)}: ${chalk.red("Read error")}`);
      }
    }
  } catch (e) {
    console.error(chalk.red(`Error scanning directory: ${e.message}`));
  }
}

function detectPlatform(frontmatter) {
  // Check for Claude-specific fields
  if (
    frontmatter["allowed-tools"] ||
    frontmatter.context ||
    frontmatter.hooks ||
    frontmatter.agent ||
    frontmatter["user-invocable"]
  ) {
    return platforms.claude;
  }

  // Check for OpenCode-specific fields
  if (frontmatter.license || frontmatter.compatibility) {
    return platforms.opencode;
  }

  // Check for Codex-specific metadata
  if (frontmatter.metadata && frontmatter.metadata["short-description"]) {
    return platforms.codex;
  }

  // Default to Gemini (minimal schema)
  return platforms.gemini;
}
