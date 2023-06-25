import { z } from "zod";

export const MessageValidator = z.object({
  id: z.string(),
  senderId: z.string(),
  receiverId: z.string(),
  text: z.string(),
  timestamp: z.number(),
});

export const MessageArrayValidator = z.array(MessageValidator);

export type MessageType = z.infer<typeof MessageValidator>;
