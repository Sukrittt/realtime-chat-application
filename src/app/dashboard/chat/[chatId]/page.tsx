import { notFound } from "next/navigation";

import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { fetchRedis } from "@/helpers/redis";
import { MessageArrayValidator } from "@/lib/validators/message";

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
  const chatPartner = (await db.get(`user:${chatPartnerId}`)) as User;

  const initialMessages = await getChatMessages(chatId);

  return <div>{chatId}</div>;
};

export default page;
