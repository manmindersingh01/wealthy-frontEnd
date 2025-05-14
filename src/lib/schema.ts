import { z } from "zod";

export const spaceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  balance: z.number().min(0, "Balance must be greater than 0"),
  description: z.string().min(1, "Description is required"),
  isDefault: z.boolean().optional(),
});

export type Space = z.infer<typeof spaceSchema>;

export const transactionSchema = z.object({
  id: z.number().optional(),
  amount: z.number().min(0, "Amount must be greater than 0"),
  userId: z.number().optional(),
  spaceId: z.number(),
  type: z.enum(["income", "expense"]),
  description: z.string().min(1, "Description is required"),
  date: z.string().min(1, "Date is required"),
  category: z.string().min(1, "Category is required"),
  receiptUrl: z.string().optional(),
  isRecurring: z.number().optional(),
  recurringInterval: z
    .enum(["daily", "weekly", "monthly", "yearly"])
    .optional(),
  nextRecurringDate: z.string().optional(),
  lastProcessedDate: z.string().optional(),
  status: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Transaction = z.infer<typeof transactionSchema>;
