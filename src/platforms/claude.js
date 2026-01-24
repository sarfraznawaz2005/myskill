import { z } from "zod";
import path from "path";
import os from "os";
import { agentSkillsBaseSchema } from "./baseSchema.js";

export const claude = {
  id: "claude",
  name: "Claude Code",
  docsUrl: "https://code.claude.com/docs/en/skills",
  defaultPath: path.join(os.homedir(), ".claude", "skills"),
  schema: agentSkillsBaseSchema.extend({
    model: z.string().optional(),
    context: z.enum(["fork"]).optional(),
    agent: z.string().optional(),
    hooks: z.any().optional(),
    "user-invocable": z.boolean().optional(),
  }),
  prompts: [
    {
      type: "confirm",
      name: "restrictTools",
      message: "Do you want to restrict allowed tools?",
      default: false,
    },
    {
      type: "input",
      name: "allowedTools",
      message: "Enter allowed tools (comma separated):",
      when: (answers) => answers.restrictTools,
      filter: (input) =>
        input
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
    },
  ],
};
