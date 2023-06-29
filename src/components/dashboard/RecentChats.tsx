import { FC } from "react";
import { Session } from "next-auth";
import Image from "next/image";
import Link from "next/link";

import { chatHrefConstructor, formatName, trimMessage } from "@/lib/utils";

type ExtendedMessage = {
  lastMessage: Message | null;
} & Pick<User, "id" | "name" | "email" | "image">;

interface RecentChatsProps {
  friendsWithLastMessage: ExtendedMessage[];
  session: Session;
}

const RecentChats: FC<RecentChatsProps> = ({
  friendsWithLastMessage,
  session,
}) => {
  return (
    <div className="col-span-2">
      <p className="text-zinc-700 mb-2 font-semibold text-sm">
        Your recent chats
      </p>
      <div className="relative bg-white hover:bg-zinc-100 transition rounded-xl shadow-md p-3 flex flex-col gap-y-4 max-h-[400px] overflow-y-auto scrollbar-thumb-blue-lighter scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch">
        {friendsWithLastMessage.length === 0 ? (
          <p className="text-sm text-zinc-500">Nothing to show here...</p>
        ) : (
          friendsWithLastMessage.map((friend) => {
            const formatedUserName = formatName(friend.name);

            return (
              <Link
                key={friend.id}
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
                  <h4 className="text-zinc-800 font-medium">
                    {formatedUserName}
                  </h4>
                  {friend.lastMessage && (
                    <span className="mt-1 max-w-md break-words text-sm">
                      <span className="text-zinc-400">
                        {friend.lastMessage.senderId === session.user.id &&
                          "You: "}
                      </span>
                      {trimMessage(friend.lastMessage.text, 40)}
                    </span>
                  )}
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RecentChats;
