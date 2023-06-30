"use client";
import { FC, Fragment, useEffect, useRef, useState } from "react";
import { format, isSameDay, isSameWeek, isSameYear, subDays } from "date-fns";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios, { AxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";

import { MessageReactionType, MessageType } from "@/lib/validators/message";
import { chatHrefConstructor, cn, toPusherKey, trimMessage } from "@/lib/utils";
import { pusherClient } from "@/lib/pusher";
import ChatContenxtMenu from "@/components/chat/ChatContenxtMenu";
import useMessageModal from "@/hooks/useMessage";
import { IdRequestType } from "@/lib/validators/add-friend";
import { toast } from "@/hooks/use-toast";
import { emogiType } from "@/types/typing";
import { useAuthToast } from "@/hooks/useAuthToast";

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
  const [seen, setSeen] = useState<boolean>(false);

  const router = useRouter();
  const { setReplyTo } = useMessageModal();
  const { loginToast } = useAuthToast();

  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`chat:${chatId}`));

    const triggerFunction = (message: MessageType) => {
      setMessages((prev) => [message, ...prev]);
    };

    const triggerReaction = (updatedMessage: MessageType) => {
      setMessages((prevMessages) => {
        return prevMessages.map((message) => {
          if (message.id === updatedMessage.id) {
            return updatedMessage;
          }
          return message;
        });
      });
    };

    pusherClient.bind("incoming-message", triggerFunction);
    pusherClient.bind("reacting-message", triggerReaction);

    return () => {
      pusherClient.unsubscribe(toPusherKey(`chat:${chatId}`));
      pusherClient.unbind("incoming-message", triggerFunction);
      pusherClient.unbind("reacting-message", triggerFunction);
    };
  }, [chatId]);

  useEffect(() => {
    setSeen(false);

    pusherClient.subscribe(toPusherKey(`chat:seen:${sessionId}`));

    const triggerFunction = () => {
      setSeen(true);
    };

    pusherClient.bind("seen-message", triggerFunction);

    if (messages.length === 0) return;

    if (messages[0].senderId === sessionId) return;

    const sendSeenEventCall = async () => {
      try {
        const payload: IdRequestType = { senderId: chatPartner.id };

        await axios.post("/api/message/seen", payload);
      } catch (error) {
        toast({
          title: "Something went wrong",
          description: "Please refresh the page and try again.",
          variant: "destructive",
        });
        router.refresh();
      }
    };

    sendSeenEventCall();

    return () => {
      pusherClient.unsubscribe(toPusherKey(`chat:seen:${sessionId}`));
      pusherClient.unbind("seen-message", triggerFunction);
    };
  }, [chatPartner.id, messages, router, sessionId]);

  const copyToClipboard = async (messageId: string) => {
    try {
      const message = messages.find((message) => message.id === messageId);
      if (!message) return;

      await navigator.clipboard.writeText(message.text);
      toast({
        description: "Copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const formatTimeStamp = (timestamp: number) => {
    return format(timestamp, "HH:mm");
  };

  const formatTimeGaps = (timestamp: number) => {
    return format(timestamp, "dd-MMM-yyyy");
  };

  const provideTimeStampInBetween = (
    providedTimestamp: number,
    previousTimestamp: number
  ) => {
    const previousDate = new Date(previousTimestamp);
    const providedDate = new Date(providedTimestamp);

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
    if (!message) return;

    setReplyTo(message);
  };

  const reactToMessage = (id: string, reaction: emogiType) => {
    const message = messages.find((message) => message.id === id);
    if (!message) return;

    const chatId = chatHrefConstructor(sessionId, chatPartner.id);

    react({ id, emogi: reaction, chatId });
  };

  const { mutate: react } = useMutation({
    mutationFn: async ({ id, emogi, chatId }: MessageReactionType) => {
      const payload: MessageReactionType = { id, emogi, chatId };

      const { data } = await axios.post("/api/message/react", payload);
      return data;
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        const status = error.response?.status;
        if (status === 401) {
          return loginToast();
        }
      }
      toast({
        title: "Something went wrong",
        description: "Please refresh the page and try again.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      router.refresh();
      toast({
        description: "Reacted to message",
      });
    },
  });

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

        const showSeen = seen && index === 0;

        const atLeastOneReaction =
          message.receiverReaction &&
          message.senderReaction &&
          message.receiverReaction !== null &&
          message.senderReaction !== null;

        const bothPeopleReactedSameEmogi =
          atLeastOneReaction &&
          message.receiverReaction === message.senderReaction;

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
                    copyMessage={copyToClipboard}
                    reactToMessage={reactToMessage}
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
                        <div
                          className={cn(
                            "absolute rounded-full bg-zinc-100 transition hover:bg-zinc-200 -bottom-3.5",
                            {
                              "left-5": isCurrentUser,
                              "right-5": !isCurrentUser,
                            }
                          )}
                        >
                          {bothPeopleReactedSameEmogi ? (
                            <ReactedSameEmogi
                              message={message}
                              isCurrentUser={isCurrentUser}
                              sessionImage={sessionImage}
                              chatPartnerImage={chatPartner.image}
                            />
                          ) : (
                            <>
                              {message?.receiverReaction && (
                                <span
                                  className={cn("rounded-full bg-zinc-100")}
                                >
                                  {message.receiverReaction}
                                </span>
                              )}
                              {message?.senderReaction && (
                                <span
                                  className={cn("rounded-full bg-zinc-100")}
                                >
                                  {message.senderReaction}
                                </span>
                              )}
                            </>
                          )}
                        </div>
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
              {showSeen && index == 0 && (
                <span className="text-zinc-500 text-xs flex justify-end font-medium mx-10 mt-1">
                  Seen
                </span>
              )}
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

  const userMessage = !currentUser
    ? message.senderId !== sessionId
    : message.senderId === sessionId;

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

interface ReactedSameEmogiProps {
  isCurrentUser: boolean;
  message: MessageType;
  sessionImage: string | null | undefined;
  chatPartnerImage: string;
}

const ReactedSameEmogi: FC<ReactedSameEmogiProps> = ({
  isCurrentUser,
  message,
  sessionImage,
  chatPartnerImage,
}) => {
  return (
    <div
      className={cn("rounded-full bg-zinc-100 flex gap-x-2 items-center px-1", {
        "flex-row-reverse": !isCurrentUser,
      })}
    >
      <span className="text-sm">{message.receiverReaction}</span>
      <div className="flex gap-x-1 items-center">
        <div className="h-4 w-4 relative">
          <Image
            src={sessionImage || "/images/placeholder-user-3.png"}
            referrerPolicy="no-referrer"
            alt="Your profile picture"
            className="rounded-full"
            fill
          />
        </div>
        <div className="h-4 w-4 relative">
          <Image
            src={chatPartnerImage || "/images/placeholder-user-3.png"}
            referrerPolicy="no-referrer"
            className="rounded-full"
            alt="Partner's profile picture"
            fill
          />
        </div>
      </div>
    </div>
  );
};
