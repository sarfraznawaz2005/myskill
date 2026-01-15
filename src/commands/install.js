import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import { platforms, getPlatformPath } from "../platforms/index.js";
import { promptWithCancellation } from "../utils/prompt.js";

export async function install(sourcePath, options = {}) {
  const resolvedSource = path.resolve(sourcePath);
  if (!(await fs.pathExists(resolvedSource))) {
    console.error(
      chalk.red(`Error: Source path ${resolvedSource} does not exist`),
    );
    process.exit(1);
  }

  let platform;
  if (options.platform) {
    platform = platforms[options.platform];
    if (!platform) {
      console.error(chalk.red(`Error: Unknown platform '${options.platform}'`));
      process.exit(1);
    }
  } else {
    console.log(
      chalk.yellow("Platform not specified. Attempting to detect..."),
    );

    const skillMdPath = path.join(resolvedSource, "SKILL.md");
    if (await fs.pathExists(skillMdPath)) {
      // Exists
    }

    const answers = await promptWithCancellation([
      {
        type: "list",
        name: "platform",
        message: "Select target platform to install to:",
        choices: Object.values(platforms).map((p) => ({
          name: p.name,
          value: p.id,
        })),
      },
    ]);
    platform = platforms[answers.platform];
  }

  const skillName = path.basename(resolvedSource);
  const globalPath = await getPlatformPath(platform.id);
  const targetDir = path.join(globalPath, skillName);

  if (await fs.pathExists(targetDir)) {
    if (options.force) {
      // Continue
    } else if (options.nonInteractive) {
      console.error(
        chalk.red(
          `Error: Skill already exists at ${targetDir}. Use --force to overwrite.`,
        ),
      );
      process.exit(1);
    } else {
      const { overwrite } = await promptWithCancellation([
        {
          type: "confirm",
          name: "overwrite",
          message: `Skill '${skillName}' already exists in ${platform.name} global directory. Overwrite?`,
          default: false,
        },
      ]);

      if (!overwrite) {
        console.log(chalk.red("Installation aborted."));
        return;
      }
    }
  }

  try {
    await fs.ensureDir(globalPath);
    await fs.copy(resolvedSource, targetDir, {
      filter: (src) => {
        const basename = path.basename(src);
        return basename !== "node_modules" && basename !== ".git";
      },
    });
    console.log(
      chalk.green(`Successfully installed '${skillName}' to ${targetDir}`),
    );
  } catch (e) {
    console.error(chalk.red(`Installation failed: ${e.message}`));
    process.exit(1);
  }
}
