import Link from "next/link";

import { toast } from "./use-toast";
import { buttonVariants } from "@/ui/Button";

export const useAuthToast = () => {
  const loginToast = () => {
    const { dismiss } = toast({
      title: "Login required.",
      description: "You need to be logged in to do that.",
      variant: "destructive",
      action: (
        <Link
          href="/login"
          onClick={() => dismiss()}
          className={buttonVariants()}
        >
          Login
        </Link>
      ),
    });
  };

  return { loginToast };
};
