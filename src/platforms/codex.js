import { z } from "zod";
import path from "path";
import os from "os";

export const codex = {
  id: "codex",
  name: "OpenAI Codex",
  docsUrl: "https://developers.openai.com/codex/skills",
  defaultPath: path.join(os.homedir(), ".codex", "skills"),
  schema: z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    metadata: z
      .object({
        "short-description": z.string().optional(),
      })
      .optional(),
  }),
  prompts: [
    {
      type: "input",
      name: "shortDescription",
      message: "Short description (for UI):",
    },
  ],
};
