"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";

import Button from "@/ui/Button";
import { Github, Google, Icons } from "@/components/Icons";
import { toast } from "@/hooks/use-toast";

type Provider = "google" | "github";

const Page = () => {
  const [isLoading, setIsLoading] = useState<Provider | null>(null);

  const loginWithProviders = async (provider: Provider) => {
    setIsLoading(provider);

    try {
      await signIn(provider);
    } catch (error) {
      toast({
        title: "Authentication Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <>
      <div className="flex items-center min-h-screen justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full flex flex-col items-center max-w-md space-y-8">
          <div className="flex flex-col justify-center items-center gap-x-4">
            <Icons.Logo className="h-8 w-auto text-indigo-600" />
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              Sign in to your account
            </h2>
          </div>
          <div className="space-y-4 w-full">
            <Button
              variant="ghost"
              isLoading={isLoading === "google"}
              className="border border-zinc-300 max-w-sm mx-auto w-full flex justify-center"
              onClick={() => loginWithProviders("google")}
            >
              {isLoading !== "google" && <Google />} Google
            </Button>

            <Button
              isLoading={isLoading === "github"}
              className="border border-zinc-300 max-w-sm mx-auto w-full flex justify-center"
              onClick={() => loginWithProviders("github")}
              variant="ghost"
            >
              {isLoading !== "github" && <Github />} Github
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
