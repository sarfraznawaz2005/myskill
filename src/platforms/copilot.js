import { z } from "zod";
import path from "path";
import os from "os";
import { agentSkillsBaseSchema } from "./baseSchema.js";

export const copilot = {
  id: "copilot",
  name: "GitHub Copilot CLI",
  docsUrl: "https://docs.github.com/copilot/concepts/agents/about-agent-skills",
  defaultPath: path.join(os.homedir(), ".copilot", "skills"),
  schema: agentSkillsBaseSchema,
  prompts: [
    {
      type: "input",
      name: "license",
      message: "License (e.g., MIT):",
    },
    {
      type: "input",
      name: "compatibility",
      message: "Compatibility (e.g., github-copilot):",
    },
  ],
};
