import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="relative">
        <input
          className={cn(
            "flex h-10 w-full rounded-md border border-neutral-300 dark:border-neutral-600",
            "bg-surface-light dark:bg-surface-dark",
            "px-3 py-2 text-sm",
            "text-gray-800 dark:text-gray-100",
            "placeholder:text-gray-500 dark:placeholder:text-gray-400",
            "shadow-sm",
            "transition-colors duration-200",
            "focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error &&
              "border-destructive focus:ring-destructive dark:focus:ring-destructive",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-destructive dark:text-destructive">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
