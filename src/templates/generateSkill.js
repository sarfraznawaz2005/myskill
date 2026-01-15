import yaml from "js-yaml";

export function generateSkill(frontMatter, content) {
  const yamlStr = yaml.dump(frontMatter, { lineWidth: -1 });
  const defaultContent =
    content ||
    `# ${frontMatter.name}

## Instructions
Provide clear, step-by-step guidance for the agent here.

## Examples
Show concrete examples of using this skill.
`;

  return `---
${yamlStr}---

${defaultContent}`;
}
