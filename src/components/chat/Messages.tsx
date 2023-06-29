"use client";
import { FC, Fragment, useEffect, useRef, useState } from "react";
import { format, isSameDay, isSameWeek, isSameYear, subDays } from "date-fns";
import Image from "next/image";

import { MessageType } from "@/lib/validators/message";
import { cn, toPusherKey, trimMessage } from "@/lib/utils";
import { pusherClient } from "@/lib/pusher";
import ChatContenxtMenu from "@/components/chat/ChatContenxtMenu";
import useMessageModal from "@/hooks/useMessage";

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

  const { setReplyTo } = useMessageModal();

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

  // const provideTimeStampInBetween = (
  //   providedtimestamp: number,
  //   previousTimestamp: number
  // ) => {
  //   const previousDate = new Date(previousTimestamp);
  //   const providedDate = new Date(providedtimestamp);

  //   const isDifferentDay = !isSameDay(previousDate, providedDate);

  //   return isDifferentDay;
  // };

  const provideTimeStampInBetween = (
    providedTimestamp: number,
    previousTimestamp: number
  ) => {
    const previousDate = new Date(previousTimestamp);
    const providedDate = new Date(providedTimestamp);

    console.log("previousDate", previousDate);
    console.log("providedDate", providedDate);
    console.log("------------");

    const currentDate = new Date();

    const hourDifference = Math.abs(
      providedDate.getHours() - previousDate.getHours()
    );

    if (hourDifference < 1) {
      return;
    }

    if (isSameDay(providedDate, currentDate)) {
      return format(providedDate, "'Today' HH:mm");
    }

    const yesterday = subDays(currentDate, 1);
    if (isSameDay(providedDate, yesterday)) {
      return format(providedDate, "'Yesterday' HH:mm");
    }

    if (isSameWeek(providedDate, currentDate)) {
      return format(providedDate, "EEE HH:mm");
    }

    if (isSameYear(providedDate, currentDate)) {
      return format(providedDate, "dd MMM, HH:mm");
    }

    return format(providedDate, "dd-MMM-yyyy");
  };

  const replyToMessage = (id: string) => {
    const message = messages.find((message) => message.id === id);
    setReplyTo(message!);
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

        const imageSrc =
          (isCurrentUser ? (sessionImage as string) : chatPartner.image) ||
          "/images/placeholder-user-3.png";

        const displayTimeStamp =
          index !== messages.length - 1 &&
          provideTimeStampInBetween(
            messages[index].timestamp,
            messages[index + 1].timestamp
          );

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
                    "flex flex-col space-y-2 text-base max-w-xs md:max-w-md mx-2 justify-end",
                    {
                      "order-1 items-end": isCurrentUser,
                      "order-2 items-start": !isCurrentUser,
                    }
                  )}
                >
                  <ChatContenxtMenu
                    messageId={message.id}
                    replyToMessage={replyToMessage}
                  >
                    {message.replyTo && (
                      <ReplyMessage
                        message={message.replyTo}
                        sessionId={sessionId}
                        currentUser={isCurrentUser}
                      />
                    )}
                    <div
                      className={cn("w-full flex", {
                        "justify-end": isCurrentUser,
                      })}
                    >
                      <div
                        className={cn(
                          "px-4 py-2 rounded-xl inline-flex justify-end break-words w-auto relative",
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
                  </ChatContenxtMenu>
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
                    src={imageSrc}
                    referrerPolicy="no-referrer"
                    className="rounded-full"
                    alt="user-profile"
                  />
                </div>
              </div>
            </div>
            {displayTimeStamp && (
              <p className="text-center text-zinc-500 text-xs font-semibold my-5">
                {displayTimeStamp}
              </p>
            )}
          </Fragment>
        );
      })}
      {messages.length > 0 && (
        <p className="text-center text-zinc-500 text-xs font-semibold my-5">
          {formatTimeGaps(messages[messages.length - 1].timestamp)}
        </p>
      )}
    </div>
  );
};

export default Messages;

const ReplyMessage = ({
  message,
  sessionId,
  currentUser,
}: {
  message: MessageType;
  sessionId: string;
  currentUser: boolean;
}) => {
  const trimmedMessage = trimMessage(message.text, 50);
  const userMessage = message.senderId === sessionId;

  return (
    <div
      className={cn("border-zinc-200 h-10 relative w-[400px]", {
        "border-r-[3px]": currentUser,
        "border-l-[3px]": !currentUser,
      })}
    >
      <div
        className={cn(
          "flex justify-end absolute rounded-xl px-4 py-2 text-sm",
          {
            "bg-gray-200 text-zinc-500": userMessage,
            "bg-indigo-500 text-zinc-200": !userMessage,
            "right-1": currentUser,
            "left-1": !currentUser,
          }
        )}
      >
        {trimmedMessage}
      </div>
    </div>
  );
};
