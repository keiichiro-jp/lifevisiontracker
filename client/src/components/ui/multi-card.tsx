import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface MultiCardOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface MultiCardGroupProps {
  options: MultiCardOption[];
  value?: string[];
  onValueChange?: (value: string[]) => void;
  className?: string;
  variant?: "outline" | "default";
}

const MultiCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    checked?: boolean;
    disabled?: boolean;
    variant?: "outline" | "default";
  }
>(({ className, checked, disabled, variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative cursor-pointer rounded-xl p-4 text-sm transition-all duration-200",
      checked
        ? "border-2 border-primary shadow-sm"
        : "border-2 border-gray-200 hover:border-primary/50",
      disabled && "cursor-not-allowed opacity-50",
      variant === "outline" ? "bg-transparent" : "bg-white",
      className
    )}
    {...props}
  >
    {checked && (
      <div className="absolute top-2 right-2 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
        <Check className="h-3.5 w-3.5 text-white" />
      </div>
    )}
    {props.children}
  </div>
));
MultiCard.displayName = "MultiCard";

const MultiCardGroup = React.forwardRef<
  HTMLDivElement,
  MultiCardGroupProps
>(({ className, options, value = [], onValueChange, variant = "default", ...props }, ref) => {
  const toggleOption = (optionValue: string) => {
    if (!onValueChange) return;
    
    const newValue = [...value];
    const index = newValue.indexOf(optionValue);
    
    if (index > -1) {
      newValue.splice(index, 1);
    } else {
      newValue.push(optionValue);
    }
    
    onValueChange(newValue);
  };

  return (
    <div
      ref={ref}
      className={cn("grid grid-cols-2 gap-3", className)}
      {...props}
    >
      {options.map((option) => (
        <MultiCard
          key={option.value}
          checked={value.includes(option.value)}
          onClick={() => {
            if (!option.disabled) {
              toggleOption(option.value);
            }
          }}
          disabled={option.disabled}
          variant={variant}
        >
          {option.icon && (
            <div className="flex justify-center items-center h-10 mb-2">
              {option.icon}
            </div>
          )}
          <div className="text-center">
            <span className="block text-gray-900 font-medium">
              {option.label}
            </span>
            {option.description && (
              <span className="block text-gray-500 text-xs mt-1">
                {option.description}
              </span>
            )}
          </div>
        </MultiCard>
      ))}
    </div>
  );
});
MultiCardGroup.displayName = "MultiCardGroup";

export { MultiCard, MultiCardGroup };
