import { getAuthSession } from "@/lib/auth";

const page = async () => {
  const session = await getAuthSession();

  return <div>dashboard</div>;
};

export default page;
