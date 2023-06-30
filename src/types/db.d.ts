interface User {
  id: string;
  name: string;
  email: string;
  image: string;
}

interface Chat {
  id: string;
  messages: Message[];
}
interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  replyTo?: Message;
  timestamp: number;
  senderReaction?: string | null;
  receiverReaction?: string | null;
}

interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
}
