"use client";
import { FC, useRef, useState } from "react";
import { format } from "date-fns";
import Image from "next/image";

import { MessageType } from "@/lib/validators/message";
import { cn } from "@/lib/utils";

interface MessagesProps {
  initialMessages: MessageType[];
  sessionId: string;
  sessionImage: string | null | undefined;
  chatPartner: User;
}

const Messages: FC<MessagesProps> = ({
  initialMessages,
  sessionId,
  chatPartner,
  sessionImage,
}) => {
  const scrolldownRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<MessageType[]>(initialMessages);

  const formatTimeStamp = (timestamp: number) => {
    return format(timestamp, "HH:mm");
  };

  return (
    <div
      className="flex h-full flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
      id="messages"
    >
      <div ref={scrolldownRef} />

      {messages.map((message, index) => {
        const isCurrentUser = message.senderId === sessionId;
        const nextMessageFromSameUser =
          messages[index - 1]?.senderId === messages[index].senderId;

        return (
          <div key={`${message.id}-${message.timestamp}`} id="chat-message">
            <div
              className={cn("flex items-end", {
                "justify-end": isCurrentUser,
              })}
            >
              <div
                className={cn(
                  "flex flex-col space-y-2 text-base max-w-xs mx-2",
                  {
                    "order-1 items-end": isCurrentUser,
                    "order-2 items-start": !isCurrentUser,
                  }
                )}
              >
                <span
                  className={cn("px-4 py-2 rounded-lg inline-block", {
                    "bg-indigo-600 text-white": isCurrentUser,
                    "bg-gray-200 text-gray-900": !isCurrentUser,
                    "rounded-br-none":
                      !nextMessageFromSameUser && isCurrentUser,
                    "rounded-bl-none":
                      !nextMessageFromSameUser && !isCurrentUser,
                  })}
                >
                  {message.text}{" "}
                  <span className="ml-2 text-xs text-gray-400">
                    {formatTimeStamp(message.timestamp)}
                  </span>
                </span>
              </div>

              <div
                className={cn("relative w-6 h-6", {
                  "order-2": isCurrentUser,
                  "order-1": !isCurrentUser,
                  invisible: nextMessageFromSameUser,
                })}
              >
                <Image
                  fill
                  src={
                    isCurrentUser
                      ? (sessionImage as string)
                      : chatPartner.image || "/images/placeholder-3.png"
                  }
                  referrerPolicy="no-referrer"
                  className="rounded-full"
                  alt="user-profile"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Messages;
