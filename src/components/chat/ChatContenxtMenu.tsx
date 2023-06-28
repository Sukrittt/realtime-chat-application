import { FC, ReactNode } from "react";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/ui/ContextMenu";
import { Copy, Reply, Star, Trash2 } from "lucide-react";

interface ChatContenxtMenuProps {
  children: ReactNode;
  messageId: string;
  replyToMessage: (id: string) => void;
}

const ChatContenxtMenu: FC<ChatContenxtMenuProps> = ({
  children,
  messageId,
  replyToMessage,
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
        <ContextMenuItem inset>
          Copy
          <ContextMenuShortcut>
            <Copy className="h-4 w-4 text-zinc-700" />
          </ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem inset>
          Star
          <ContextMenuShortcut>
            <Star className="h-4 w-4 text-zinc-700" />
          </ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem inset>
          Delete
          <ContextMenuShortcut>
            <Trash2 className="h-4 w-4 text-zinc-700" />
          </ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <div className="flex justify-around w-full">
          <ContextMenuItem className="text-xl rounded-full">😂</ContextMenuItem>
          <ContextMenuItem className="text-xl rounded-full">😍</ContextMenuItem>
          <ContextMenuItem className="text-xl rounded-full">🥳</ContextMenuItem>
          <ContextMenuItem className="text-xl rounded-full">😭</ContextMenuItem>
        </div>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default ChatContenxtMenu;
