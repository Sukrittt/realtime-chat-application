"use client";
import { FC, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { Check, X } from "lucide-react";
import { UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

import { IdRequestType } from "@/lib/validators/add-friend";
import { useAuthToast } from "@/hooks/useAuthToast";
import { toast } from "@/hooks/use-toast";

interface FriendRequestsProps {
  incomingFriendRequests: IncomingFriendRequest[];
  sessionId: string;
}

const FriendRequests: FC<FriendRequestsProps> = ({
  incomingFriendRequests,
  sessionId,
}) => {
  const [friendRequests, setFriendRequests] = useState<IncomingFriendRequest[]>(
    incomingFriendRequests
  );
  const router = useRouter();
  const { loginToast } = useAuthToast();

  const { mutate: acceptFriend } = useMutation({
    mutationFn: async ({ senderId }: IdRequestType) => {
      const payload: IdRequestType = { senderId };
      const { data } = await axios.post("/api/friends/accept", payload);

      return data;
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          return loginToast();
        } else if (error.response?.status === 422) {
          return toast({
            title: "Invalid data passed",
            description: "Please try again.",
            variant: "destructive",
          });
        }
      }

      return toast({
        title: "Something went wrong",
        description: "Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: ({ senderId }: IdRequestType) => {
      setFriendRequests((prev) =>
        prev.filter((request) => request.senderId !== senderId)
      );

      router.refresh();
    },
  });

  const { mutate: declineFriend } = useMutation({
    mutationFn: async ({ senderId }: IdRequestType) => {
      const payload: IdRequestType = { senderId };
      const { data } = await axios.post("/api/friends/decline", payload);

      return data;
    },
    onError: () => {},
    onSuccess: ({ senderId }: IdRequestType) => {
      setFriendRequests((prev) =>
        prev.filter((request) => request.senderId !== senderId)
      );

      router.refresh();
    },
  });

  return (
    <>
      {friendRequests.length === 0 ? (
        <p className="text-sm text-zinc-500">Nothing to show here...</p>
      ) : (
        friendRequests.map((request) => (
          <div key={request.senderId} className="flex gap-4 items-center">
            <UserPlus className="text-black" />
            <p className="font-medium text-lg">{request.senderEmail}</p>

            <button
              aria-label="Accept friend request"
              onClick={() => acceptFriend({ senderId: request.senderId })}
              className="w-8 h-8 bg-indigo-600 hover:bg-indigo-700 grid place-items-center rounded-full transition hover:shadow-md"
            >
              <Check className="font-semibold text-white w-3/4 h-3/4" />
            </button>
            <button
              aria-label="Decline friend request"
              onClick={() => declineFriend({ senderId: request.senderId })}
              className="w-8 h-8 bg-red-600 hover:bg-red-700 grid place-items-center rounded-full transition hover:shadow-md"
            >
              <X className="font-semibold text-white w-3/4 h-3/4" />
            </button>
          </div>
        ))
      )}
    </>
  );
};

export default FriendRequests;
