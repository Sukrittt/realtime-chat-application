import { FC } from "react";
import { Loader2 } from "lucide-react";
import { cva, VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVairants = cva(
  "active:scale-95 inline-flex items-center rounded-md text-sm font-medium transition-color focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-slate-900 text-white hover:bg-slate-800",
        ghost: "bg-transparent hover:text-slate-900 hover:bg-slate-200",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-2",
        lg: "h-11 px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVairants> {
  isLoading?: boolean;
}

const Button: FC<ButtonProps> = ({
  className,
  isLoading,
  type = "button",
  variant,
  size,
  children,
  ...props
}) => {
  return (
    <button
      type={type}
      className={cn(buttonVairants({ variant, size, className }))}
      disabled={isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-r animate-spin" />}
      {children}
    </button>
  );
};

export default Button;
