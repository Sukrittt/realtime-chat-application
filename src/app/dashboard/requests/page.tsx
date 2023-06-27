import { notFound } from "next/navigation";

import { fetchRedis } from "@/helpers/redis";
import { getAuthSession } from "@/lib/auth";
import FriendRequests from "@/components/Friends/FriendRequests";

const page = async () => {
  const session = await getAuthSession();

  if (!session) return notFound();

  const incomingSenderIds = (await fetchRedis(
    "smembers",
    `user-${session.user.id}:incoming_friend_requests`
  )) as string[];

  const incomingFriendRequests = await Promise.all(
    incomingSenderIds.map(async (senderId) => {
      const senderResult = (await fetchRedis(
        "get",
        `user:${senderId}`
      )) as string;
      const sender = JSON.parse(senderResult) as User;

      return {
        senderId,
        senderEmail: sender.email,
      };
    })
  );

  return (
    <main className="pt-8">
      <h1 className="font-bold text-5xl mb-8">Your friend requests</h1>
      <div className="flex flex-col gap-4">
        <FriendRequests
          incomingFriendRequests={incomingFriendRequests}
          sessionId={session.user.id}
        />
      </div>
    </main>
  );
};

export default page;
