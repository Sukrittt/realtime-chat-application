import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const loading = () => {
  return (
    <div className="w-full flex flex-col gap-y-2 pt-8">
      <Skeleton className="mb-4" height={60} width={500} />
      <div className="flex flex-col gap-y-4">
        <Skeleton height={35} className="w-full" />
        <Skeleton height={35} className="w-full" />
        <Skeleton height={35} className="w-full" />
      </div>
    </div>
  );
};

export default loading;
