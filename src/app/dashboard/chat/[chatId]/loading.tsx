import { cn } from "@/lib/utils";
import { Fragment } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const loading = () => {
  return (
    <div className="flex flex-col flex-1 justify-between h-full max-h-[calc(100vh-6rem)]">
      <div className="flex sm:items-center justify-between py-3 border-b-2 border-gray-200">
        <div className="relative flex items-center space-x-4">
          <Skeleton className="h-8 w-8 rounded-full" />

          <div className="flex flex-col leading-tight">
            <div className="text-xl flex items-center">
              <Skeleton className="mr-2" height={20} width={200} />
            </div>
            <Skeleton height={20} width={300} />
          </div>
        </div>
      </div>

      <div
        className="flex h-full flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue-lighter scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
        id="messages"
      >
        {Array.from({ length: 10 }, (_, index) => index + 1).map((index) => {
          const rightSideMsgs = [0, 2, 6, 8];
          const leftSideMsgs = [1, 3, 4, 5, 6, 9];

          const isRightSideUser = rightSideMsgs.includes(index);
          const nextMessageFromSameUser = isRightSideUser
            ? rightSideMsgs.includes(index + 1)
            : leftSideMsgs.includes(index + 1);

          return (
            <Fragment key={index}>
              <div id="chat-message">
                <div
                  className={cn("flex items-end", {
                    "justify-end": isRightSideUser,
                  })}
                >
                  <div
                    className={cn(
                      "flex flex-col space-y-2 text-base max-w-xs md:max-w-md mx-2",
                      {
                        "order-1 items-end": isRightSideUser,
                        "order-2 items-start": !isRightSideUser,
                        "rounded-br-none":
                          !nextMessageFromSameUser && isRightSideUser,
                        "rounded-bl-none":
                          !nextMessageFromSameUser && !isRightSideUser,
                      }
                    )}
                  >
                    <Skeleton height={40} width={300} />
                  </div>

                  <div
                    className={cn("relative w-6 h-6", {
                      "order-2": isRightSideUser,
                      "order-1": !isRightSideUser,
                      invisible: nextMessageFromSameUser,
                    })}
                  >
                    <Skeleton className="w-6 h-6" borderRadius={9999} />
                  </div>
                </div>
              </div>
            </Fragment>
          );
        })}
      </div>
      <Skeleton height={100} className="w-full" />
    </div>
  );
};

export default loading;
