"use client";
import { FC, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { chatHrefConstructor } from "@/lib/utils";

interface SidebarChatListsProps {
  friends: User[];
  sessionId: string;
}

const SidebarChatLists: FC<SidebarChatListsProps> = ({
  friends,
  sessionId,
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const [unseenMessages, setUnseenMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (pathname?.includes("chat")) {
      setUnseenMessages((prev) => {
        return prev.filter((message) => !pathname.includes(message.senderId));
      });
    }
  }, [pathname]);

  return (
    <ul role="list" className="max-h-[25rem] overflow-y-auto -mx-2 space-y-1">
      {friends.sort().map((friend) => {
        const unseenMessageCount = unseenMessages.filter((unseenMsg) => {
          return unseenMsg.senderId === friend.id;
        }).length;
        const href = chatHrefConstructor(friend.id, sessionId);

        return (
          <li key={friend.id}>
            <a
              href={href}
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
