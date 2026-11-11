import * as React from "react";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 uppercase tracking-wide",
  {
    variants: {
      variant: {
        default:
          "bg-white text-neutral-700 border-pink-200 border-2 border-b-4 active:border-b-2 hover:bg-pink-50/70",

        // custom
        locked:
          "bg-neutral-200 text-primary-foreground hover:bg-neutral-200/90 border-neutral-400 border-b-4 active:border-b-0",

        primary:
          "bg-pink-500 text-primary-foreground hover:bg-pink-500/90 border-pink-600 border-b-4 active:border-b-0",
        primaryOutline:
          "bg-white text-rose-600 hover:bg-rose-50 border-rose-200",

        secondary:
          "bg-gradient-to-r from-[#C81E3A] to-rose-500 text-primary-foreground hover:opacity-95 border-[#9E142B] border-b-4 active:border-b-0",
        secondaryOutline: "bg-white text-[#C81E3A] hover:bg-rose-50",

        danger:
          "bg-rose-600 text-primary-foreground hover:bg-rose-600/90 border-rose-800 border-b-4 active:border-b-0",
        dangerOutline: "bg-white text-rose-600 hover:bg-rose-50",

        super:
          "bg-gradient-to-r from-rose-500 to-pink-500 text-primary-foreground hover:opacity-95 border-rose-700 border-b-4 active:border-b-0",
        superOutline: "bg-white text-pink-600 hover:bg-pink-50",

        ghost:
          "bg-transparent text-slate-600 border-transparent border-0 hover:bg-pink-100/60",

        sidebar:
          "bg-transparent text-neutral-600 border-2 border-transparent hover:bg-pink-100/50 transition-none",
        sidebarOutline:
          "bg-rose-500/10 text-[#C81E3A] border-rose-300 border-2 hover:bg-rose-500/15 transition-none",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-12 px-8",
        icon: "h-10 w-10",

        // custom
        rounded: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
