import { z } from "zod";

export const MessageValidator = z.object({
  id: z.string(),
  senderId: z.string(),
  text: z.string(),
  timestamp: z.number(),
});

export const MessageArrayValidator = z.array(MessageValidator);

export type MessageType = z.infer<typeof MessageValidator>;

export const SendMessageValidator = z.object({
  text: z.string(),
  chatId: z.string(),
});

export type SendMessageType = z.infer<typeof SendMessageValidator>;
