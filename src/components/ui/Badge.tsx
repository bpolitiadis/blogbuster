import { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Mood } from "@/lib/themes";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-1 text-sm font-medium transition-all duration-200 shadow-sm dark:shadow-lg",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-primary/90",
        secondary: "bg-secondary text-white hover:bg-secondary/90",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        outline:
          "border border-neutral-300 dark:border-neutral-600 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800",
        success: "bg-green-500 text-white hover:bg-green-600",
        // Mood-based variants
        romantic: "bg-accent-romantic text-white hover:bg-accent-romantic/90",
        sciFi: "bg-accent-sciFi text-white hover:bg-accent-sciFi/90",
        mystery: "bg-accent-mystery text-white hover:bg-accent-mystery/90",
        adventure:
          "bg-accent-adventure text-white hover:bg-accent-adventure/90",
        fantasy: "bg-accent-fantasy text-white hover:bg-accent-fantasy/90",
        horror: "bg-accent-horror text-white hover:bg-accent-horror/90",
        comedy: "bg-accent-comedy text-white hover:bg-accent-comedy/90",
        drama: "bg-accent-drama text-white hover:bg-accent-drama/90",
        thriller: "bg-accent-thriller text-white hover:bg-accent-thriller/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  mood?: Mood;
}

export function Badge({ className, variant, mood, ...props }: BadgeProps) {
  // If mood is provided, use it as the variant
  const effectiveVariant =
    (mood?.toLowerCase() as VariantProps<typeof badgeVariants>["variant"]) ||
    variant;

  return (
    <div
      className={cn(badgeVariants({ variant: effectiveVariant }), className)}
      {...props}
    />
  );
}

export { badgeVariants };
