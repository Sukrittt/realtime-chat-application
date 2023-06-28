import { z } from "zod";

export const dummyMessage = z.object({
  id: z.string(),
  senderId: z.string(),
  text: z.string().min(1).max(1500),
  timestamp: z.number(),
});

export const MessageValidator = z.object({
  id: z.string(),
  senderId: z.string(),
  text: z.string().min(1).max(1500),
  timestamp: z.number(),
  replyTo: dummyMessage.optional(),
});

export const MessageArrayValidator = z.array(MessageValidator);

export type MessageType = z.infer<typeof MessageValidator>;

export const SendMessageValidator = z.object({
  text: z.string(),
  chatId: z.string(),
  replyTo: dummyMessage.optional(),
});

export type SendMessageType = z.infer<typeof SendMessageValidator>;
