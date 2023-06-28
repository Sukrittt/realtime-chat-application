"use client";
import { FC, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { chatHrefConstructor, toPusherKey, trimMessage } from "@/lib/utils";
import { pusherClient } from "@/lib/pusher";
import { toast } from "@/hooks/use-toast";
import { buttonVariants } from "@/ui/Button";

interface SidebarChatListsProps {
  friends: User[];
  sessionId: string;
}

interface ExtendedMessage extends Message {
  senderImage: string;
  senderName: string;
}

const SidebarChatLists: FC<SidebarChatListsProps> = ({
  friends,
  sessionId,
}) => {
  const pathname = usePathname();
  const router = useRouter();

  const [unseenMessages, setUnseenMessages] = useState<Message[]>([]);
  const [activeChats, setActiveChats] = useState<User[]>(friends);

  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`user-${sessionId}:chats`));
    pusherClient.subscribe(toPusherKey(`user-${sessionId}:friends`));

    const newMessageHandler = (message: ExtendedMessage) => {
      const chatHref = `/dashboard/chat/${chatHrefConstructor(
        sessionId,
        message.senderId
      )}`;
      const shouldNotifyUser = pathname !== chatHref;
      const trimmedDescription = trimMessage(message.text, 50);
      if (!shouldNotifyUser) return;

      const { dismiss } = toast({
        title: `${message.senderName}`,
        description: `${trimmedDescription}`,
        action: (
          <a
            href={chatHref}
            onClick={() => dismiss()}
            className={buttonVariants({ variant: "ghost" })}
          >
            Open chat
          </a>
        ),
      });
      setUnseenMessages((prev) => [...prev, message]);
    };
    const newFriendHandler = (newFriend: User) => {
      setActiveChats((prev) => [...prev, newFriend]);
    };

    pusherClient.bind("new_message", newMessageHandler);
    pusherClient.bind("new_friend", newFriendHandler);

    return () => {
      pusherClient.unsubscribe(toPusherKey(`user-${sessionId}:chats`));
      pusherClient.unsubscribe(toPusherKey(`user-${sessionId}:friends`));

      pusherClient.unbind("new_message", newMessageHandler);
      pusherClient.unbind("new_friend", newFriendHandler);
    };
  }, [pathname, sessionId, router]);

  useEffect(() => {
    if (pathname?.includes("chat")) {
      setUnseenMessages((prev) => {
        return prev.filter((message) => !pathname.includes(message.senderId));
      });
    }
  }, [pathname]);

  return (
    <ul role="list" className="max-h-[25rem] overflow-y-auto -mx-2 space-y-1">
      {activeChats.sort().map((friend) => {
        const unseenMessageCount = unseenMessages.filter((unseenMsg) => {
          return unseenMsg.senderId === friend.id;
        }).length;
        const chatHref = `/dashboard/chat/${chatHrefConstructor(
          friend.id,
          sessionId
        )}`;

        return (
          <li key={friend.id}>
            <a
              href={chatHref}
              className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
            >
              {friend.name}
              {unseenMessageCount > 0 && (
                <div className="bg-indigo-600 font-medium text-xs text-white w-4 h-4 rounded-full flex justify-center items-center">
                  {unseenMessageCount}
                </div>
              )}
            </a>
          </li>
        );
      })}
    </ul>
  );
};

export default SidebarChatLists;
