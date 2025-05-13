import { z } from "zod";

export const spaceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  balance: z.number().min(0, "Balance must be greater than 0"),
  description: z.string().min(1, "Description is required"),
  isDefault: z.boolean().optional(),
});

export type Space = z.infer<typeof spaceSchema>;
