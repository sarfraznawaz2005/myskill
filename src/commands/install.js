import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import { platforms, getPlatformPath } from "../platforms/index.js";
import { promptWithCancellation } from "../utils/prompt.js";

async function installToPlatform(sourcePath, platform, options = {}) {
  const skillName = path.basename(sourcePath);
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
        console.log(
          chalk.red("Installation aborted for platform:", platform.name),
        );
        return;
      }
    }
  }

  try {
    await fs.ensureDir(globalPath);
    await fs.copy(sourcePath, targetDir, {
      filter: (src) => {
        const basename = path.basename(src);
        return basename !== "node_modules" && basename !== ".git";
      },
    });
    console.log(
      chalk.green(
        `Successfully installed '${skillName}' to ${targetDir} (${platform.name})`,
      ),
    );
  } catch (e) {
    console.error(
      chalk.red(`Installation failed for ${platform.name}: ${e.message}`),
    );
    // Don't exit, continue to next platform
  }
}

export async function install(sourcePath, options = {}) {
  const resolvedSource = path.resolve(sourcePath);
  if (!(await fs.pathExists(resolvedSource))) {
    console.error(
      chalk.red(`Error: Source path ${resolvedSource} does not exist`),
    );
    process.exit(1);
  }

  let selectedPlatforms = [];
  if (options.platform) {
    const platform = platforms[options.platform];
    if (!platform) {
      console.error(chalk.red(`Error: Unknown platform '${options.platform}'`));
      process.exit(1);
    }
    selectedPlatforms = [platform];
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
        choices: [
          ...Object.values(platforms).map((p) => ({
            name: p.name,
            value: p.id,
          })),
          { name: "ALL platforms", value: "all" },
        ],
      },
    ]);
    if (answers.platform === "all") {
      selectedPlatforms = Object.values(platforms);
    } else {
      selectedPlatforms = [platforms[answers.platform]];
    }
  }

  for (const platform of selectedPlatforms) {
    await installToPlatform(resolvedSource, platform, options);
  }
}
