import { z } from "zod";

export const emailValidator = z.object({
  email: z.string().email(),
});

export type EmailRequestType = z.infer<typeof emailValidator>;

export const IdValidator = z.object({
  senderId: z.string(),
});

export type IdRequestType = z.infer<typeof IdValidator>;
