import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const loading = () => {
  return (
    <div className="px-4 md:container py-12 grid grid-cols-1 md:grid-cols-3 gap-x-2 gap-y-4">
      <div className="col-span-2 max-h-[calc(100vh-130px)]">
        <Skeleton height={20} width={150} />
        <Skeleton height={250} className="w-full" />
      </div>
      <div className="h-[calc(100vh-120px)]">
        <Skeleton height={20} width={150} />
        <Skeleton height={250} className="w-full" />
      </div>
    </div>
  );
};

export default loading;
