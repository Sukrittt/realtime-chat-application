import { ZodError } from "zod";

import { IdValidator } from "@/lib/validators/add-friend";
import { getAuthSession } from "@/lib/auth";
import { fetchRedis } from "@/helpers/redis";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { senderId } = IdValidator.parse(body);

    const session = await getAuthSession();

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    //should not be friends already
    const isAlreadyFriends = await fetchRedis(
      "sismember",
      `user-${session.user.id}:friends`,
      senderId
    );

    if (isAlreadyFriends) {
      return new Response("Already friends", { status: 400 });
    }

    //should have a pending request
    const hasFriendRequest = await fetchRedis(
      "sismember",
      `user-${session.user.id}:incoming_friend_requests`,
      senderId
    );

    if (!hasFriendRequest) {
      return new Response("No friend request", { status: 400 });
    }

    //accept friend request
    await db.sadd(`user-${session.user.id}:friends`, senderId);
    await db.sadd(`user-${senderId}:friends`, session.user.id);

    //remove ids from friend request
    await db.srem(`user-${senderId}:incoming_friend_requests`, session.user.id);
    await db.srem(`user-${session.user.id}:incoming_friend_requests`, senderId);

    return new Response("OK");
  } catch (error) {
    if (error instanceof ZodError) {
      return new Response("Invalid request type", { status: 422 });
    }

    return new Response("Something went wrong", { status: 400 });
  }
}