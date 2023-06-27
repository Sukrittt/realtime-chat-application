import { ZodError } from "zod";
import { nanoid } from "nanoid";

import { getAuthSession } from "@/lib/auth";
import {
  MessageType,
  MessageValidator,
  SendMessageValidator,
} from "@/lib/validators/message";
import { fetchRedis } from "@/helpers/redis";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { chatId, text } = SendMessageValidator.parse(body);

    const session = await getAuthSession();

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const [userId1, userId2] = chatId.split("--");

    if (session.user.id !== userId1 && session.user.id !== userId2) {
      return new Response("Unauthorized", { status: 401 });
    }

    const chatPartnerId = userId1 === session.user.id ? userId2 : userId1;

    const userFriendList = (await fetchRedis(
      "smembers",
      `user-${session.user.id}:friends`
    )) as string[];
    const chatPartnerIsYourFriend = userFriendList.includes(chatPartnerId);

    if (!chatPartnerIsYourFriend) {
      return new Response("Not your friend", { status: 403 });
    }

    const rawSender = (await fetchRedis(
      "get",
      `user:${session.user.id}`
    )) as string;
    const sender = JSON.parse(rawSender) as User;

    const timestamp = Date.now();

    const messageData: MessageType = {
      id: nanoid(),
      senderId: session.user.id,
      text,
      timestamp,
    };

    const message = MessageValidator.parse(messageData);

    //all checks complete ✅
    pusherServer.trigger(
      toPusherKey(`chat:${chatId}`),
      "incoming-message",
      message
    );

    pusherServer.trigger(
      toPusherKey(`user-${chatPartnerId}:chats`),
      "new_message",
      {
        ...message,
        senderImage: sender.image,
        senderName: sender.name,
      }
    );

    await db.zadd(`chat:${chatId}:messages`, {
      score: timestamp,
      member: JSON.stringify(message),
    });

    return new Response("OK");
  } catch (error) {
    if (error instanceof ZodError) {
      return new Response("Invalid request type", { status: 422 });
    }

    return new Response("Something went wrong", { status: 400 });
  }
}
