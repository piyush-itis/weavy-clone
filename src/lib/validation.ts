import { z } from "zod";

export const LLMRequestSchema = z.object({
  system_prompt: z.string().optional(),
  user_message: z.string().min(1, "User message is required"),
  images: z.array(z.string()).optional(),
});

export type LLMRequestInput = z.infer<typeof LLMRequestSchema>;

