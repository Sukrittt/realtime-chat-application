"use client";
import { FC, useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { Check, X } from "lucide-react";
import { UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

import { IdRequestType } from "@/lib/validators/add-friend";
import { useAuthToast } from "@/hooks/useAuthToast";
import { toast } from "@/hooks/use-toast";
import { pusherClient } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";

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

  //pusher
  useEffect(() => {
    pusherClient.subscribe(
      toPusherKey(`user-${sessionId}:incoming_friend_requests`)
    );

    const friendRequestHandler = ({
      senderId,
      senderEmail,
    }: IncomingFriendRequest) => {
      setFriendRequests((prev) => [...prev, { senderId, senderEmail }]);
    };

    pusherClient.bind("incoming_friend_requests", friendRequestHandler); //listen to this event

    return () => {
      pusherClient.unsubscribe(
        toPusherKey(`user-${sessionId}:incoming_friend_requests`)
      );
      pusherClient.unbind("incoming_friend_requests", friendRequestHandler);
    };
  }, [sessionId]);

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
    onSuccess: () => {
      toast({
        title: "Friend request accepted",
        description: "You are now friends with this user.",
      });

      router.refresh();
    },
    onMutate: ({ senderId }: IdRequestType) => {
      setFriendRequests((prev) =>
        prev.filter((request) => request.senderId !== senderId)
      );
    },
  });

  const { mutate: declineFriend } = useMutation({
    mutationFn: async ({ senderId }: IdRequestType) => {
      const payload: IdRequestType = { senderId };
      const { data } = await axios.post("/api/friends/decline", payload);

      return data;
    },
    onError: () => {},
    onSuccess: () => {
      router.refresh();
    },
    onMutate: ({ senderId }: IdRequestType) => {
      setFriendRequests((prev) =>
        prev.filter((request) => request.senderId !== senderId)
      );
    },
  });

  return (
    <div className="rounded-xl bg-white shadow-md p-3 w-1/2">
      {friendRequests.length === 0 ? (
        <p className="text-sm text-zinc-500">Nothing to show here...</p>
      ) : (
        friendRequests.map((request) => (
          <div
            key={request.senderId}
            className="flex gap-4 items-center w-full justify-around"
          >
            <div className="flex items-center gap-x-3 w-full">
              <UserPlus className="text-black" />
              <p className="font-medium text-lg">{request.senderEmail}</p>
            </div>
            <div className="flex items-center justify-evenly w-2/3">
              <button
                aria-label="Accept friend request"
                onClick={() => acceptFriend({ senderId: request.senderId })}
                className="w-7 h-7 bg-indigo-600 hover:bg-indigo-700 grid place-items-center rounded-full transition hover:shadow-md"
              >
                <Check className="font-semibold text-white w-3/4 h-3/4" />
              </button>
              <button
                aria-label="Decline friend request"
                onClick={() => declineFriend({ senderId: request.senderId })}
                className="w-7 h-7 bg-red-600 hover:bg-red-700 grid place-items-center rounded-full transition hover:shadow-md"
              >
                <X className="font-semibold text-white w-3/4 h-3/4" />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default FriendRequests;
