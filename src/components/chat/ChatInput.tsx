"use client";
import { FC, useEffect, useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { X } from "lucide-react";

import Button from "@/ui/Button";
import { MessageType, SendMessageType } from "@/lib/validators/message";
import { useAuthToast } from "@/hooks/useAuthToast";
import { toast } from "@/hooks/use-toast";
import useMessageModal from "@/hooks/useMessage";
import { trimMessage } from "@/lib/utils";

interface ChatInputProps {
  chatPartner: User;
  chatId: string;
}

const ChatInput: FC<ChatInputProps> = ({ chatPartner, chatId }) => {
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const [input, setInput] = useState<string>("");
  const { replyTo, reset } = useMessageModal();

  const { loginToast } = useAuthToast();

  const { mutate: sendMessage, isLoading } = useMutation({
    mutationFn: async () => {
      const payload: SendMessageType = {
        text: input,
        chatId,
        replyTo: replyTo,
      };
      const { data } = await axios.post("/api/message/send", payload);

      return data;
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        const errorStatus = error.response?.status;
        if (errorStatus === 401) {
          return loginToast();
        }
        if (errorStatus === 403) {
          return toast({
            title: "Error",
            description: "You are not allowed to send messages to this chat.",
            variant: "destructive",
          });
        }
      }
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      setInput("");
      reset();
      textAreaRef.current?.focus();
    },
  });

  const [change, setChange] = useState(false); //I seriously don't know why this works : )

  useEffect(() => {
    window.addEventListener("keydown", (event) => {
      if (event.code === "Escape" && replyTo) {
        reset();
      }
    });
  }, [replyTo, reset]);

  useEffect(() => {
    setChange((prev) => !prev);
  }, [replyTo]);

  useEffect(() => {
    textAreaRef.current?.focus();
  }, [change]);

  return (
    <div className="border-t border-gray-200 px-4 pt-4 mb-2 sm:mb-0">
      {replyTo && <ReplyTo replyTo={replyTo} />}
      <div className="relative flex-1 overflow-hidden rounded-lg shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-600 pr-1 pt-1">
        <TextareaAutosize
          ref={textAreaRef}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !e.shiftKey &&
              input.length !== 0 &&
              !isLoading
            ) {
              e.preventDefault();
              sendMessage();
            }
          }}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Message ${chatPartner.name}`}
          className="block w-full resize-none border-0 bg-transparent text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:py-1.5 sm:text-sm sm:leading-6 max-h-36 overflow-y-auto scrollbar-thumb-blue-lighter scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
        />

        <div
          onClick={() => textAreaRef.current?.focus()}
          aria-hidden="true"
          className="py-2"
        >
          <div className="py-px">
            <div className="h-9" />
          </div>
        </div>

        <div className="absolute right-0 bottom-0 flex justify-between py-2 pl-3 pr-2">
          <div className="flex-shrink-0">
            <Button
              onClick={() => sendMessage()}
              isLoading={isLoading}
              disabled={input.length === 0 || isLoading}
              type="submit"
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;

interface ReplyToProps {
  replyTo: MessageType;
}

const ReplyTo: FC<ReplyToProps> = ({ replyTo }) => {
  const { reset } = useMessageModal();

  const trimmedMessage = trimMessage(replyTo.text, 100);

  return (
    <div className="rounded-md border-l-4 mb-1 bg-zinc-300 border-indigo-600 p-2 flex items-center justify-between">
      <span className="text-zinc-500 text-sm">{trimmedMessage}</span>
      <div
        onClick={() => reset()}
        className="cursor-pointer focus:outline-none focus-ring-2 focus:ring-offset-2 focus:ring-slate-400"
      >
        <X className="h-4 w-4 text-zinc-700" />
      </div>
    </div>
  );
};
