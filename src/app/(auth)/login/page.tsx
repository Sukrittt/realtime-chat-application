"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";

import Button from "@/ui/Button";
import { Google, Icons } from "@/components/Icons";
import { toast } from "@/hooks/use-toast";

const Page = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loginWithGoogle = async () => {
    setIsLoading(true);

    try {
      await signIn("google");
    } catch (error) {
      toast({
        title: "Authentication Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8 border border-red-500">
        <div className="w-full flex flex-col items-center max-w-md space-y-8">
          <div className="flex items-center gap-x-4">
            <Icons.Logo className="h-8 w-auto text-indigo-600" />
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              Sign in to your account
            </h2>
          </div>

          <Button
            isLoading={isLoading}
            className="max-w-sm mx-auto w-full flex justify-center"
            onClick={loginWithGoogle}
          >
            {!isLoading && <Google />} Google
          </Button>
        </div>
      </div>
    </>
  );
};

export default Page;
