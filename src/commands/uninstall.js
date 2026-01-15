import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import { platforms, getPlatform, getPlatformPath } from "../platforms/index.js";
import { promptWithCancellation } from "../utils/prompt.js";
import { getAllInstalledSkills } from "../utils/skills.js";

async function uninstallSkill(targetPath, options = {}) {
  try {
    await fs.remove(targetPath);
    console.log(chalk.green(`Successfully removed skill from ${targetPath}`));
  } catch (e) {
    console.error(chalk.red(`Error removing skill: ${e.message}`));
  }
}

export async function uninstall(name, options = {}) {
  let skillName = name;
  let targetPaths = [];

  if (!skillName) {
    if (options.nonInteractive) {
      console.error(
        chalk.red("Error: Skill name is required in non-interactive mode."),
      );
      process.exit(1);
      return;
    }

    const allSkills = await getAllInstalledSkills();
    if (allSkills.length === 0) {
      console.error(chalk.red("Error: No installed skills found."));
      process.exit(1);
      return;
    }

    const { selectedSkills } = await promptWithCancellation([
      {
        type: "checkbox",
        name: "selectedSkills",
        message: "Select skills to uninstall:",
        choices: allSkills.map((s) => ({
          name: `${chalk.bold(s.name)} [${s.platform.name}] (${s.location}) - ${s.description}`,
          value: s.path,
        })),
        validate: (input) =>
          input.length > 0 ? true : "You must select at least one skill.",
      },
    ]);

    targetPaths = selectedSkills;
  } else {
    let targetPath;
    if (options.platform) {
      const platform = getPlatform(options.platform);
      if (!platform) {
        console.error(
          chalk.red(`Error: Unknown platform '${options.platform}'`),
        );
        process.exit(1);
      }

      const globalPath = await getPlatformPath(platform.id);
      const pPath = path.join(globalPath, skillName);
      if (await fs.pathExists(pPath)) {
        targetPath = pPath;
      }
    }

    if (!targetPath) {
      const found = [];
      for (const p of Object.values(platforms)) {
        const globalPath = await getPlatformPath(p.id);
        const pPath = path.join(globalPath, skillName);
        if (await fs.pathExists(pPath)) {
          found.push({ platform: p, path: pPath, location: "Global" });
        }

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
      } else {
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
          targetPaths = found.map((f) => f.path);
        } else {
          targetPath = answer.target;
        }
      }
    }

    if (targetPath) {
      targetPaths = [targetPath];
    }
  }

  if (targetPaths.length > 0 && !options.nonInteractive) {
    const { confirm } = await promptWithCancellation([
      {
        type: "confirm",
        name: "confirm",
        message: `Are you sure you want to delete ${targetPaths.length} skill(s)? This cannot be undone.`,
        default: false,
      },
    ]);

    if (!confirm) {
      console.log(chalk.yellow("Aborted."));
      return;
    }
  }

  for (const p of targetPaths) {
    await uninstallSkill(p, options);
  }
}
