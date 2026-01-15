import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import yaml from "js-yaml";
import Fuse from "fuse.js";
import { platforms, getPlatformPath } from "../platforms/index.js";

export async function find(query, options = {}) {
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

  const allSkills = [];

  // Gather skills
  for (const platform of targetPlatforms) {
    const globalPath = await getPlatformPath(platform.id);
    const locations = [{ name: "Global", path: globalPath, type: "global" }];

    const localBase =
      platform.id === "opencode" ? ".opencode/skill" : `.${platform.id}/skills`;
    locations.push({
      name: "Project",
      path: path.join(process.cwd(), localBase),
      type: "project",
    });

    for (const loc of locations) {
      if (await fs.pathExists(loc.path)) {
        try {
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
                    allSkills.push({
                      name: fm.name || item.name,
                      description: fm.description || "",
                      platform: platform.name,
                      platformId: platform.id,
                      location: loc.name,
                      path: skillPath,
                    });
                  }
                } catch (e) {
                  // Ignore read errors
                }
              }
            }
          }
        } catch (e) {
          // Ignore readdir errors
        }
      }
    }
  }

  if (allSkills.length === 0) {
    console.log(chalk.yellow("No skills found."));
    return;
  }

  let results = allSkills;

  if (query) {
    const fuse = new Fuse(allSkills, {
      keys: ["name", "description"],
      threshold: 0.4, // Fuzzy threshold (0.0 = exact match, 1.0 = match anything)
      includeScore: true,
    });
    results = fuse.search(query).map((r) => r.item);
  }

  // Display results
  if (results.length === 0) {
    console.log(chalk.yellow(`No skills matched query '${query}'`));
    return;
  }

  console.log(chalk.bold(`Found ${results.length} skills:`));
  console.log("------------------------------------------------");

  // Group by platform for cleaner output? Or just list.
  // List seems better for search results.

  results.forEach((skill) => {
    console.log(
      `${chalk.green(skill.name)} ${chalk.gray(`[${skill.platform} | ${skill.location}]`)}`,
    );
    if (skill.description) {
      console.log(`  ${skill.description}`);
    }
    console.log("");
  });
}
