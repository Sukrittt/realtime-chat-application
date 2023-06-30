import { Icon } from "@/components/Icons";

interface SidebarOption {
  id: number;
  name: string;
  href: string;
  Icon: Icon;
}

type emogiType = "❤️" | "😂" | "😍" | "😡" | "😭";
interface ReactionType {
  id: string;
  emogi: emogiType;
}
