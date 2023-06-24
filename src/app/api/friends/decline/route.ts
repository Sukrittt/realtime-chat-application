import { ZodError } from "zod";

import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";
import { IdValidator } from "@/lib/validators/add-friend";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { senderId } = IdValidator.parse(body);

    const session = await getAuthSession();
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    await db.srem(`user-${session.user.id}:incoming_friend_requests`, senderId);

    return new Response("OK");
  } catch (error) {
    if (error instanceof ZodError) {
      return new Response("Invalid request type", { status: 422 });
    }

    return new Response("Something went wrong", { status: 400 });
  }
}
