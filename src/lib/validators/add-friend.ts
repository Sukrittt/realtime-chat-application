import { z } from "zod";

export const emailValidator = z.object({
  email: z.string().email(),
});

export type EmailRequestType = z.infer<typeof emailValidator>;
