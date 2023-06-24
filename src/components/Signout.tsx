"use client";
import { FC } from "react";
import { useMutation } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

import Button from "@/ui/Button";
import { toast } from "@/hooks/use-toast";

interface SignoutProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const Signout: FC<SignoutProps> = ({ ...props }) => {
  const { mutate: signout, isLoading } = useMutation({
    mutationFn: async () => {
      await signOut();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Error signing out. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <Button
      isLoading={isLoading}
      onClick={() => signout()}
      {...props}
      variant="ghost"
    >
      {!isLoading && <LogOut className="h-4 w-4" />}
    </Button>
  );
};

export default Signout;
