import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const loading = () => {
  return (
    <div className="w-full flex flex-col gap-y-2 pt-8">
      <Skeleton className="mb-4" height={60} width={300} />
      <Skeleton height={20} width={150} />
      <div className="flex gap-x-4">
        <Skeleton height={40} width={300} />
        <Skeleton height={40} width={60} />
      </div>
    </div>
  );
};

export default loading;
