import { FC } from "react";
import { Session } from "next-auth";
import Image from "next/image";
import Link from "next/link";

import { chatHrefConstructor, formatName, trimMessage } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

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
  const messageContent = (lastMessage: Message | null) => {
    if (!lastMessage) return;

    const providedTimeStamp = lastMessage.timestamp;

    if (lastMessage.senderId === session.user.id) {
      return `Sent ${formatDistanceToNow(providedTimeStamp, {
        addSuffix: true,
      })}`;
    }

    const trimmedText = trimMessage(lastMessage.text, 30);

    return `${trimmedText} · ${formatDistanceToNow(providedTimeStamp, {
      addSuffix: true,
    })}`;
  };

  return (
    <div className="col-span-2">
      <p className="text-zinc-700 mb-2 font-semibold text-sm">
        Your recent chats
      </p>
      <div className="relative bg-white rounded-xl shadow-md flex flex-col max-h-[400px] overflow-y-auto scrollbar-thumb-blue-lighter scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch">
        {friendsWithLastMessage.length === 0 ? (
          <p className="text-sm text-zinc-500 p-3">Nothing to show here...</p>
        ) : (
          friendsWithLastMessage.map((friend) => {
            const messageDetails = messageContent(friend.lastMessage);
            const filteredFriendsWithNoMessage = friendsWithLastMessage.filter(
              (friend) => friend.lastMessage
            );

            if (!messageDetails && filteredFriendsWithNoMessage.length > 0)
              return;

            if (!messageDetails)
              return (
                <p className="text-sm text-zinc-500 p-3">
                  Your recent chats will show up here...
                </p>
              );

            return (
              <RecentChat
                key={friend.id}
                friend={friend}
                sessionId={session.user.id}
                messageDetails={messageDetails}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default RecentChats;

const RecentChat = ({
  friend,
  sessionId,
  messageDetails,
}: {
  friend: ExtendedMessage;
  sessionId: string;
  messageDetails: string;
}) => {
  const formatedUserName = formatName(friend.name);

  return (
    <Link
      key={friend.id}
      href={`/dashboard/chat/${chatHrefConstructor(sessionId, friend.id)}`}
      className="relative sm:flex break-words hover:bg-zinc-100 transition px-3 py-2"
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
        <h4 className="text-zinc-800 font-medium">{formatedUserName}</h4>
        <span className="mt-1 max-w-md break-words text-xs font-medium text-zinc-400">
          {messageDetails}
        </span>
      </div>
    </Link>
  );
};
