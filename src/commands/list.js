import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import yaml from "js-yaml";
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

  for (const platform of targetPlatforms) {
    console.log(chalk.blue(`\n=== ${platform.name} Skills ===`));

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
                  console.log(
                    `- ${chalk.bold(fm.name)} (${loc.name}): ${fm.description || "No description"}`,
                  );
                } else {
                  console.log(`- ${item.name} (${loc.name}): [Invalid Format]`);
                }
              } catch (e) {
                console.log(`- ${item.name} (${loc.name}): [Read Error]`);
              }
            }
          }
        }
      }
    }
  }
}
