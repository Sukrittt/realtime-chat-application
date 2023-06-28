import { create } from "zustand";

import { MessageType } from "@/lib/validators/message";

interface MessageModalStore {
  replyTo: MessageType | undefined;
  setReplyTo: (message: MessageType) => void;
  reset: () => void;
}

const useMessageModal = create<MessageModalStore>((set) => ({
  replyTo: undefined,
  setReplyTo: (message: MessageType) => set({ replyTo: message }),
  reset: () => set({ replyTo: undefined }),
}));

export default useMessageModal;
