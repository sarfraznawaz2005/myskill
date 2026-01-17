import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import yaml from "js-yaml";
import Table from "cli-table3";
import { platforms, getPlatformPath } from "../platforms/index.js";

export async function list(options = {}) {
  let targetPlatforms = [];
  if (options.platform) {
    if (platforms[options.platform]) {
      targetPlatforms.push(platforms[options.platform]);
    } else {
      console.error(chalk.red(`Error: Unknown platform '${options.platform}'`));
      process.exit(1);
    }
  } else {
    targetPlatforms = Object.values(platforms);
  }

  const skillMap = {};

  for (const platform of targetPlatforms) {
    const globalPath = await getPlatformPath(platform.id);
    const locations = [{ name: "Global", path: globalPath }];

    const localBase =
      platform.id === "opencode" ? ".opencode/skill" : `.${platform.id}/skills`;
    locations.push({
      name: "Project",
      path: path.join(process.cwd(), localBase),
    });

    for (const loc of locations) {
      if (await fs.pathExists(loc.path)) {
        const items = await fs.readdir(loc.path, { withFileTypes: true });
        for (const item of items) {
          if (item.isDirectory()) {
            const skillPath = path.join(loc.path, item.name, "SKILL.md");
            if (await fs.pathExists(skillPath)) {
              try {
                const content = await fs.readFile(skillPath, "utf8");
                const match = content.match(/^---\n([\s\S]*?)\n---/);
                if (match) {
                  const fm = yaml.load(match[1]);
                  const skillName = fm.name;
                  if (!skillMap[skillName]) {
                    skillMap[skillName] = {
                      description: fm.description || "No description",
                      platforms: [],
                      location: loc.name,
                    };
                  }
                  if (!skillMap[skillName].platforms.includes(platform.name)) {
                    skillMap[skillName].platforms.push(platform.name);
                  }
                }
              } catch (e) {
                // Intentionally skip errors to avoid cluttering output
              }
            }
          }
        }
      }
    }
  }

  const table = new Table({
    head: [
      chalk.bold("Skill Name"),
      chalk.bold("Platforms"),
      chalk.bold("Location"),
      chalk.bold("Description"),
    ],
    colWidths: [20, 40, 10, 50],
    wordWrap: true,
  });

  for (const [skillName, data] of Object.entries(skillMap)) {
    const platformsStr = chalk.cyan(data.platforms.join(", "));
    table.push([
      chalk.bold(skillName),
      platformsStr,
      data.location,
      data.description,
    ]);
  }

  console.log(chalk.bold("Skill Listing:"));
  console.log(table.toString());
}
