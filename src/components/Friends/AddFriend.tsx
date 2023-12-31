"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/ui/Input";
import Button from "@/ui/Button";
import { toast } from "@/hooks/use-toast";
import { EmailRequestType, emailValidator } from "@/lib/validators/add-friend";

const AddFriend = () => {
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<EmailRequestType>({
    resolver: zodResolver(emailValidator),
    defaultValues: {
      email: "",
    },
  });
  const [successState, setSuccessState] = useState<boolean>(false);

  const { mutate: addFriend, isLoading } = useMutation({
    mutationFn: async (email: string) => {
      const validatedEmail = emailValidator.parse({ email });
      const payload = { email: validatedEmail };

      const { data } = await axios.post("/api/friends/add", payload);
      return data;
    },
    onError: (error) => {
      if (error instanceof z.ZodError) {
        setError("email", { message: error.message });
      } else if (error instanceof AxiosError) {
        setError("email", { message: error.response?.data });
      }

      toast({
        title: "Error",
        description: "Something went wrong.",
        variant: "destructive",
      });
      setSuccessState(false);
    },
    onSuccess: () => {
      setTimeout(() => setSuccessState(false), 3000);
      setSuccessState(true);
      reset();
    },
  });

  const onSubmit = (data: EmailRequestType) => {
    addFriend(data.email);
  };

  return (
    <form className="max-w-sm" onSubmit={handleSubmit(onSubmit)}>
      <label
        htmlFor="email"
        className="block text-sm font-medium leading-6 text-gray-900"
      >
        Add friend by E-mail
      </label>
      <div className="mt-2 flex gap-4">
        <Input {...register("email")} placeholder="you@example.com" />

        <Button isLoading={isLoading} type="submit">
          Add
        </Button>
      </div>
      {errors?.email && (
        <p className="mt-1 text-sm text-red-600">{errors?.email?.message}</p>
      )}
      {successState && (
        <p className="mt-1 text-sm text-green-600">Friend request sent!</p>
      )}
    </form>
  );
};

export default AddFriend;
