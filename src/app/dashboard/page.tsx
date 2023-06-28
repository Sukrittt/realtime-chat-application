import { notFound } from "next/navigation";

import { fetchRedis } from "@/helpers/redis";
import { getAuthSession } from "@/lib/auth";
import { getFriendsByUserId } from "@/helpers/get-friends-by-userId";
import { chatHrefConstructor } from "@/lib/utils";
import RecentChats from "@/components/dashboard/RecentChats";
import Friends from "@/components/dashboard/Friends";

const page = async () => {
  const session = await getAuthSession();
  if (!session) {
    return notFound();
  }

  const friends = await getFriendsByUserId(session.user.id);

  const friendsWithLastMessage = await Promise.all(
    friends.map(async (friend) => {
      const [parsedLastMessage] = (await fetchRedis(
        "zrange",
        `chat:${chatHrefConstructor(session.user.id, friend.id)}:messages`,
        -1,
        -1
      )) as string[];

      const lastMessage = JSON.parse(parsedLastMessage) as Message;

      return {
        ...friend,
        lastMessage,
      };
    })
  );

  return (
    <div className="container py-12 grid grid-cols-1 md:grid-cols-3 gap-2">
      <RecentChats
        session={session}
        friendsWithLastMessage={friendsWithLastMessage}
      />
      <Friends friends={friends} />
    </div>
  );
};

export default page;
