"use client";
import { FC, Fragment, useEffect, useRef, useState } from "react";
import { format, isSameDay } from "date-fns";
import Image from "next/image";

import { MessageType } from "@/lib/validators/message";
import { cn, toPusherKey } from "@/lib/utils";
import { pusherClient } from "@/lib/pusher";

interface MessagesProps {
  initialMessages: MessageType[];
  sessionId: string;
  sessionImage: string | null | undefined;
  chatPartner: User;
  chatId: string;
}

const Messages: FC<MessagesProps> = ({
  initialMessages,
  sessionId,
  chatPartner,
  sessionImage,
  chatId,
}) => {
  const scrolldownRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<MessageType[]>(initialMessages);

  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`chat:${chatId}`));

    const triggerFunction = (message: MessageType) => {
      setMessages((prev) => [message, ...prev]);
    };

    pusherClient.bind("incoming-message", triggerFunction);

    return () => {
      pusherClient.unsubscribe(toPusherKey(`chat:${chatId}`));
      pusherClient.unbind("incoming-message", triggerFunction);
    };
  }, [chatId]);

  const formatTimeStamp = (timestamp: number) => {
    return format(timestamp, "HH:mm");
  };

  const formatTimeGaps = (timestamp: number) => {
    return format(timestamp, "dd-MMM-yyyy");
  };

  const provideTimeStampInBetween = (
    timestamp: number,
    previousTimestamp: number
  ) => {
    const previousDate = new Date(previousTimestamp);
    const providedDate = new Date(timestamp);

    const isDifferentDay = !isSameDay(previousDate, providedDate);

    return isDifferentDay;
  };

  return (
    <div
      className="flex h-full flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue-lighter scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
      id="messages"
    >
      <div ref={scrolldownRef} />

      {messages.map((message, index) => {
        const isCurrentUser = message.senderId === sessionId;
        const nextMessageFromSameUser =
          messages[index - 1]?.senderId === messages[index].senderId;

        return (
          <Fragment key={`${message.id}-${message.timestamp}`}>
            <div id="chat-message">
              <div
                className={cn("flex items-end", {
                  "justify-end": isCurrentUser,
                })}
              >
                <div
                  className={cn(
                    "flex flex-col space-y-2 text-base max-w-xs md:max-w-md mx-2",
                    {
                      "order-1 items-end": isCurrentUser,
                      "order-2 items-start": !isCurrentUser,
                    }
                  )}
                >
                  <div
                    className={cn(
                      "px-4 py-2 rounded-lg inline-block break-words w-full relative",
                      {
                        "bg-indigo-600 text-white": isCurrentUser,
                        "bg-gray-200 text-gray-900": !isCurrentUser,
                        "rounded-br-none":
                          !nextMessageFromSameUser && isCurrentUser,
                        "rounded-bl-none":
                          !nextMessageFromSameUser && !isCurrentUser,
                      }
                    )}
                  >
                    <span className="pr-10">{message.text}</span>{" "}
                    <span className="ml-2 text-xs text-gray-400 absolute right-3 bottom-2.5">
                      {formatTimeStamp(message.timestamp)}
                    </span>
                  </div>
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
            {index !== messages.length - 1 &&
              provideTimeStampInBetween(
                messages[index].timestamp,
                messages[index + 1].timestamp
              ) && (
                <p className="text-center text-zinc-500 text-sm my-5">
                  {formatTimeGaps(message.timestamp)}
                </p>
              )}
          </Fragment>
        );
      })}
      {messages.length > 0 && (
        <p className="text-center text-zinc-500 text-sm my-5">
          {formatTimeGaps(messages[messages.length - 1].timestamp)}
        </p>
      )}
    </div>
  );
};

export default Messages;
