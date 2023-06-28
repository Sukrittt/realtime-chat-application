import { notFound } from "next/navigation";

import { fetchRedis } from "@/helpers/redis";
import { getAuthSession } from "@/lib/auth";
import { getFriendsByUserId } from "@/helpers/get-friends-by-userId";
import { chatHrefConstructor, trimMessage } from "@/lib/utils";
import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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
    <div className="container py-12">
      <h1 className="font-bold text-5xl mb-8">Recent chats</h1>
      {friendsWithLastMessage.length === 0 ? (
        <p className="text-sm text-zinc-500">Nothing to show here...</p>
      ) : (
        friendsWithLastMessage.map((friend) => (
          <div
            key={friend.id}
            className="relative bg-zinc-50 border border-zinc-200 p-3 rounded-md"
          >
            <div className="absolute right-4 inset-y-0 flex items-center">
              <ChevronRightIcon className="h-7 w-7 text-zinc-400" />
            </div>

            <Link
              href={`/dashboard/chat/${chatHrefConstructor(
                session.user.id,
                friend.id
              )}`}
              className="relative sm:flex break-words"
            >
              <div className="mb-4 sm:mb-0 sm:mr-4">
                <div className="relative h-6 w-6">
                  <Image
                    referrerPolicy="no-referrer"
                    src={friend.image || "/images/placeholder-user-3.png"}
                    alt={`${friend.name}'s profile picture`}
                    className="rounded-full"
                    fill
                  />
                </div>
              </div>

              <div className="break-words">
                <h4 className="text-lg font-semibold">{friend.name}</h4>
                <span className="mt-1 max-w-md break-words">
                  <span className="text-zinc-400">
                    {friend.lastMessage.senderId === session.user.id && "You: "}
                  </span>
                  hello{trimMessage(friend.lastMessage.text, 40)}
                </span>
              </div>
            </Link>
          </div>
        ))
      )}
    </div>
  );
};

export default page;
