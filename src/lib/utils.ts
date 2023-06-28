import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function chatHrefConstructor(id1: string, id2: string) {
  const sortedIds = [id1, id2].sort();

  return `${sortedIds[0]}--${sortedIds[1]}`;
}

export function toPusherKey(key: string) {
  return key.replace(/:/g, "__");
}

export const trimMessage = (text: string, trimAmount: number) => {
  return text.length > trimAmount ? `${text.slice(0, trimAmount)}...` : text;
};

export function formatName(name: string) {
  // Split the name into individual words
  const words = name.toLowerCase().split(" ");

  // Capitalize the first letter of each word
  const formattedWords = words.map((word) => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  });

  // Join the words back together
  const formattedName = formattedWords.join(" ");

  return formattedName;
}
