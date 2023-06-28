import { notFound } from "next/navigation";
import Image from "next/image";

import { getAuthSession } from "@/lib/auth";
import { fetchRedis } from "@/helpers/redis";
import Messages from "@/components/chat/Messages";
import { MessageArrayValidator } from "@/lib/validators/message";
import ChatInput from "@/components/chat/ChatInput";

interface PageProps {
  params: {
    chatId: string;
  };
}

async function getChatMessages(chatId: string) {
  try {
    const results: string[] = await fetchRedis(
      "zrange",
      `chat:${chatId}:messages`,
      0,
      -1
    );

    const dbMessages = results.map((message) => JSON.parse(message) as Message);

    const reversedMessages = dbMessages.reverse();

    const messages = MessageArrayValidator.parse(reversedMessages);

    return messages;
  } catch (error) {
    notFound();
  }
}

const page = async ({ params }: PageProps) => {
  const { chatId } = params;

  const session = await getAuthSession();
  if (!session) return notFound();

  const { user } = session;

  const [userId1, userId2] = chatId.split("--");

  if (user.id !== userId1 && userId2 !== userId2) {
    return notFound();
  }

  const chatPartnerId = user.id === userId1 ? userId2 : userId1; //figuring out the id of the chat partner
  // const chatPartner = (await db.get(`user:${chatPartnerId}`)) as User;
  const chatPartnerRaw = (await fetchRedis(
    "get",
    `user:${chatPartnerId}`
  )) as string;
  const chatPartner = JSON.parse(chatPartnerRaw) as User;

  const initialMessages = await getChatMessages(chatId);

  return (
    <div className="flex flex-col flex-1 justify-between h-full max-h-[calc(100vh-6rem)]">
      <div className="flex sm:items-center justify-between py-3 border-b-2 border-gray-200">
        <div className="relative flex items-center space-x-4">
          <div className="relative">
            <div className="w-8 sm:w-12 h-8 sm:h-12">
              <Image
                src={chatPartner.image || "/images/placeholder-user-3.png"}
                alt={`${chatPartner.name}'s profile picture`}
                className="rounded-full"
                fill
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          <div className="flex flex-col leading-tight">
            <div className="text-xl flex items-center">
              <span className="text-gray-700 mr-3 font-semibold">
                {chatPartner.name}
              </span>
            </div>
            <span className="text-sm text-gray-600">{chatPartner.email}</span>
          </div>
        </div>
      </div>

      <Messages
        initialMessages={initialMessages}
        sessionId={session.user.id}
        sessionImage={session.user.image}
        chatPartner={chatPartner}
        chatId={chatId}
      />
      <ChatInput chatPartner={chatPartner} chatId={chatId} />
    </div>
  );
};

export default page;
