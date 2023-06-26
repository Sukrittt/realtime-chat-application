import { ZodError } from "zod";

import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";
import { fetchRedis } from "@/helpers/redis";
import { emailValidator } from "@/lib/validators/add-friend";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { email } = emailValidator.parse(body.email);

    const idToAdd = (await fetchRedis("get", `user:email:${email}`)) as string;

    if (!idToAdd) {
      return new Response("This person does not exist.", { status: 400 });
    }

    const session = await getAuthSession();
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    if (idToAdd === session.user.id) {
      return new Response("You can't add yourself", { status: 400 });
    }

    //check if the user is already in the friend list
    const isAlreadyAdded = (await fetchRedis(
      "sismember",
      `user:${idToAdd}:incoming_friend_requests`,
      session.user.id
    )) as 0 | 1;

    if (isAlreadyAdded) {
      return new Response("You already sent a friend request to this person", {
        status: 409,
      });
    }

    //already a friend
    const isAlreadyFriends = (await fetchRedis(
      "sismember",
      `user:${session.user.id}:friends`,
      idToAdd
    )) as 0 | 1;

    if (isAlreadyFriends) {
      return new Response("You are already friends with this person", {
        status: 409,
      });
    }

    //now this is a valid request
    pusherServer.trigger(
      toPusherKey(`user-${idToAdd}:incoming_friend_requests`),
      "incoming_friend_requests",
      {
        senderId: session.user.id,
        senderEmail: session.user.email,
      }
    );

    db.sadd(`user-${idToAdd}:incoming_friend_requests`, session.user.id);

    return new Response("OK");
  } catch (error) {
    if (error instanceof ZodError) {
      return new Response("Invalid request type", { status: 422 });
    }

    return new Response("Something went wrong", { status: 400 });
  }
}
