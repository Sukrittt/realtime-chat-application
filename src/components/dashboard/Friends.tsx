import { formatName } from "@/lib/utils";
import Image from "next/image";
import { FC } from "react";

interface FriendsProps {
  friends: User[];
}

const Friends: FC<FriendsProps> = ({ friends }) => {
  return (
    <div>
      <p className="text-zinc-700 mb-2 font-semibold text-sm">Your friends</p>
      <div className="flex flex-col gap-y-4 bg-white rounded-xl shadow-md p-3 max-h-[400px] overflow-y-auto scrollbar-thumb-blue-lighter scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch">
        {friends.length === 0 ? (
          <p className="text-sm text-zinc-500">Nothing to show here...</p>
        ) : (
          friends.map((friend) => (
            <div key={friend.id} className="flex gap-x-2 items-center">
              <div className="relative h-6 w-6">
                <Image
                  referrerPolicy="no-referrer"
                  src={friend.image || "/images/placeholder-user-3.png"}
                  alt={`${friend.name}'s profile picture`}
                  className="rounded-full"
                  fill
                />
              </div>
              <span className="text-zinc-800 text-sm font-medium">
                {formatName(friend.name)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Friends;
