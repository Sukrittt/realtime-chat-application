import { FC, ReactNode } from "react";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/ui/ContextMenu";
import { Copy, Reply } from "lucide-react";
import { ReactionType, emogiType } from "@/types/typing";

const reactionList: ReactionType[] = [
  {
    id: "1",
    emogi: "❤️",
  },
  {
    id: "2",
    emogi: "😂",
  },
  {
    id: "3",
    emogi: "😍",
  },
  {
    id: "4",
    emogi: "😡",
  },
  {
    id: "5",
    emogi: "😭",
  },
];

interface ChatContenxtMenuProps {
  children: ReactNode;
  messageId: string;
  replyToMessage: (id: string) => void;
  copyMessage: (id: string) => void;
  reactToMessage: (id: string, reaction: emogiType) => void;
}

const ChatContenxtMenu: FC<ChatContenxtMenuProps> = ({
  children,
  messageId,
  replyToMessage,
  copyMessage,
  reactToMessage,
}) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem inset onClick={() => replyToMessage(messageId)}>
          Reply
          <ContextMenuShortcut>
            <Reply className="h-4 w-4 text-zinc-700" />
          </ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem inset onClick={() => copyMessage(messageId)}>
          Copy
          <ContextMenuShortcut>
            <Copy className="h-4 w-4 text-zinc-700" />
          </ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <div className="flex justify-around w-full">
          {reactionList.map((reaction) => (
            <ContextMenuItem
              key={reaction.id}
              className="text-xl rounded-full"
              onClick={() => reactToMessage(messageId, reaction.emogi)}
            >
              {reaction.emogi}
            </ContextMenuItem>
          ))}
        </div>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default ChatContenxtMenu;
