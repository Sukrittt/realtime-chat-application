import { ZodError } from "zod";

import { fetchRedis } from "@/helpers/redis";
import { getAuthSession } from "@/lib/auth";
import { IdValidator } from "@/lib/validators/add-friend";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { senderId } = IdValidator.parse(body);

    const userFriendList = (await fetchRedis(
      "smembers",
      `user-${session.user.id}:friends`
    )) as string[];
    const chatPartnerIsYourFriend = userFriendList.includes(senderId);

    if (!chatPartnerIsYourFriend) {
      return new Response("Not your friend", { status: 403 });
    }

    //all checks done ✅
    pusherServer.trigger(
      toPusherKey(`chat:seen:${senderId}`),
      "seen-message",
      {}
    );

    return new Response("OK");
  } catch (error) {
    if (error instanceof ZodError) {
      return new Response("Invalid request type", { status: 422 });
    }

    return new Response("Something went wrong", { status: 400 });
  }
}
