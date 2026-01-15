import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import { platforms, getPlatform, getPlatformPath } from "../platforms/index.js";
import { promptWithCancellation } from "../utils/prompt.js";

async function uninstallSkill(targetPath, options = {}) {
  // Confirm deletion
  if (!options.nonInteractive) {
    const { confirm } = await promptWithCancellation([
      {
        type: "confirm",
        name: "confirm",
        message: `Are you sure you want to delete ${targetPath}? This cannot be undone.`,
        default: false,
      },
    ]);

    if (!confirm) {
      console.log(chalk.yellow("Aborted."));
      return;
    }
  }

  try {
    await fs.remove(targetPath);
    console.log(chalk.green(`Successfully removed skill from ${targetPath}`));
  } catch (e) {
    console.error(chalk.red(`Error removing skill: ${e.message}`));
    // Don't exit, continue to next skill
  }
}

export async function uninstall(name, options = {}) {
  // If name is not provided, try to infer from current directory
  let skillName = name;
  let targetPath;
  let platform;

  if (!skillName) {
    // Check if current directory is a skill
    const skillMdPath = path.join(process.cwd(), "SKILL.md");
    if (await fs.pathExists(skillMdPath)) {
      skillName = path.basename(process.cwd());
      targetPath = process.cwd();
      console.log(
        chalk.blue(`Detected skill '${skillName}' in current directory.`),
      );
    } else {
      console.error(chalk.red("Error: Skill name is required."));
      process.exit(1);
    }
  }

  // If platform is provided, look in that platform's global path
  if (options.platform) {
    platform = getPlatform(options.platform);
    if (!platform) {
      console.error(chalk.red(`Error: Unknown platform '${options.platform}'`));
      process.exit(1);
    }

    const globalPath = path.join(platform.defaultPath, skillName);
    if (await fs.pathExists(globalPath)) {
      targetPath = globalPath;
    }
  }

  // If we still don't have a target path, search in all platforms globally or check local project structure
  if (!targetPath) {
    // Search in all global locations
    const found = [];
    for (const p of Object.values(platforms)) {
      const globalPath = await getPlatformPath(p.id);
      const pPath = path.join(globalPath, skillName);
      if (await fs.pathExists(pPath)) {
        found.push({ platform: p, path: pPath, location: "Global" });
      }
    }

    // Check current directory if we didn't start there
    if (await fs.pathExists(path.join(process.cwd(), "SKILL.md"))) {
      // Check if name matches
      // Logic is tricky if user provides name but we are in a folder.
      // Assuming user provided name implies searching for it.
    }

    // Also check project local folders like .claude/skills/name
    for (const p of Object.values(platforms)) {
      const localBase =
        p.id === "opencode" ? ".opencode/skill" : `.${p.id}/skills`;
      const localPath = path.join(process.cwd(), localBase, skillName);
      if (await fs.pathExists(localPath)) {
        found.push({ platform: p, path: localPath, location: "Project" });
      }
    }

    if (found.length === 0) {
      console.error(chalk.red(`Error: Skill '${skillName}' not found.`));
      process.exit(1);
    } else if (found.length === 1) {
      targetPath = found[0].path;
      console.log(
        chalk.blue(
          `Found skill in ${found[0].platform.name} (${found[0].location})`,
        ),
      );
    } else {
      // Multiple found, ask user
      if (options.nonInteractive) {
        console.error(
          chalk.red(
            `Error: Multiple skills found with name '${skillName}'. Specify --platform or use interactive mode.`,
          ),
        );
        process.exit(1);
      }

      const answer = await promptWithCancellation([
        {
          type: "list",
          name: "target",
          message: "Multiple skills found. Which one to uninstall?",
          choices: [
            ...found.map((f) => ({
              name: `${f.platform.name} (${f.location}) - ${f.path}`,
              value: f.path,
            })),
            { name: "ALL skills", value: "all" },
          ],
        },
      ]);
      if (answer.target === "all") {
        // Uninstall all found skills
        for (const skill of found) {
          await uninstallSkill(skill.path, options);
        }
        return;
      } else {
        targetPath = answer.target;
      }
    }
  }

  await uninstallSkill(targetPath, options);
}
