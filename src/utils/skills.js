import fs from "fs-extra";
import path from "path";
import yaml from "js-yaml";
import { platforms, getPlatformPath } from "../platforms/index.js";

export function detectPlatform(frontmatter) {
  if (
    frontmatter.context ||
    frontmatter.hooks ||
    frontmatter.agent ||
    frontmatter["user-invocable"]
  ) {
    return platforms.claude;
  }

  if (
    frontmatter["allowed-tools"] &&
    !frontmatter.context &&
    !frontmatter.hooks &&
    !frontmatter.agent &&
    !frontmatter["user-invocable"]
  ) {
    return platforms.copilot;
  }

  if (frontmatter.license || frontmatter.compatibility) {
    return platforms.opencode;
  }

  if (frontmatter.metadata && frontmatter.metadata["short-description"]) {
    return platforms.codex;
  }

  return platforms.gemini;
}

export async function findSkills(dirPath) {
  const targetDir = path.resolve(dirPath);
  if (!(await fs.pathExists(targetDir))) return [];
  const items = await fs.readdir(targetDir, { withFileTypes: true });
  const skills = [];

  for (const item of items) {
    if (item.isDirectory()) {
      const skillPath = path.join(targetDir, item.name, "SKILL.md");
      if (await fs.pathExists(skillPath)) {
        try {
          const content = await fs.readFile(skillPath, "utf8");
          const match = content.match(/^---\n([\s\S]*?)\n---/);

          if (!match) {
            skills.push({
              name: item.name,
              path: path.join(targetDir, item.name),
              error: "Invalid frontmatter format",
            });
            continue;
          }

          const fm = yaml.load(match[1]);
          const platform = detectPlatform(fm);
          const description = fm.description || "No description";

          skills.push({
            name: item.name,
            path: path.join(targetDir, item.name),
            platform,
            description,
            valid: true,
          });
        } catch (e) {
          skills.push({
            name: item.name,
            path: path.join(targetDir, item.name),
            error: "Read error",
          });
        }
      }
    }
  }

  return skills;
}

export async function getAllInstalledSkills() {
  const allSkills = [];
  for (const platform of Object.values(platforms)) {
    const globalPath = await getPlatformPath(platform.id);
    const localBase =
      platform.id === "opencode"
        ? ".opencode/skill"
        : platform.id === "copilot"
          ? ".github/skills"
          : `.${platform.id}/skills`;
    const locations = [
      { name: "Global", path: globalPath },
      { name: "Project", path: path.join(process.cwd(), localBase) },
    ];

    for (const loc of locations) {
      if (await fs.pathExists(loc.path)) {
        const skills = await findSkills(loc.path);
        for (const skill of skills) {
          allSkills.push({
            ...skill,
            platform,
            location: loc.name,
          });
        }
      }
    }
  }
  return allSkills;
}
