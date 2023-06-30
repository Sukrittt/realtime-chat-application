import { ZodError } from "zod";

import { fetchRedis } from "@/helpers/redis";
import { getAuthSession } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import {
  MessageArrayValidator,
  MessageReaction,
} from "@/lib/validators/message";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { id: messageId, emogi, chatId } = MessageReaction.parse(body);

    const results: string[] = await fetchRedis(
      "zrange",
      `chat:${chatId}:messages`,
      0,
      -1
    );

    const dbMessages = results.map((message) => JSON.parse(message) as Message);
    const messages = MessageArrayValidator.parse(dbMessages) as Message[];

    const messageToReact = messages.find((message) => message.id === messageId);

    if (!messageToReact) {
      return new Response("Message not found", { status: 404 });
    }

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];

      if (message.id !== messageId) continue;

      //remove the exising message
      await fetchRedis(
        "zrem",
        `chat:${chatId}:messages`,
        JSON.stringify(message)
      );

      if (message.senderId === session.user.id) {
        if (message.senderReaction === emogi) {
          message.senderReaction = null;
        } else {
          message.senderReaction = emogi;
        }
      } else {
        if (message.receiverReaction === emogi) {
          message.receiverReaction = null;
        } else {
          message.receiverReaction = emogi;
        }
      }

      //pusher event call
      pusherServer.trigger(toPusherKey(`chat:${chatId}`), "reacting-message", {
        ...message,
      });

      await fetchRedis(
        "zadd",
        `chat:${chatId}:messages`,
        message.timestamp,
        JSON.stringify(message)
      );

      messages[i] = message;

      break;
    }

    return new Response("OK");
  } catch (error) {
    if (error instanceof ZodError) {
      return new Response("Invalid request type", { status: 422 });
    }

    return new Response("Something went wrong", { status: 400 });
  }
}
