import { z } from "zod";
import path from "path";
import os from "os";

export const gemini = {
  id: "gemini",
  name: "Gemini CLI",
  docsUrl: "https://geminicli.com/docs/cli/skills",
  defaultPath: path.join(os.homedir(), ".gemini", "skills"),
  schema: z.object({
    name: z
      .string()
      .regex(
        /^[a-z0-9-]+$/,
        "Name must be lowercase alphanumeric with hyphens",
      ),
    description: z.string().min(1),
  }),
  prompts: [],
};
