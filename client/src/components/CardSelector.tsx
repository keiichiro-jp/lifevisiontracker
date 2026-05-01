import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface CardOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface CardSelectorProps {
  options: CardOption[];
  selected: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  columns?: 1 | 2 | 3 | 4;
}

export default function CardSelector({
  options,
  selected,
  onChange,
  multiple = false,
  columns = 2,
}: CardSelectorProps) {
  const normalizeSelected = (value: string | string[]) =>
    Array.isArray(value) ? value : value ? [value] : [];

  // Convert selected to array for easier handling
  const [selectedValues, setSelectedValues] = useState<string[]>(
    normalizeSelected(selected)
  );

  // Update internal state when selected prop changes
  useEffect(() => {
    setSelectedValues(normalizeSelected(selected));
  }, [selected]);

  const handleSelect = (value: string) => {
    let newSelected: string[];

    if (multiple) {
      // For multiple selection, toggle the selected value
      newSelected = selectedValues.includes(value)
        ? selectedValues.filter(v => v !== value)
        : [...selectedValues, value];
    } else {
      // For single selection, replace the selected value
      newSelected = [value];
    }

    setSelectedValues(newSelected);
    onChange(multiple ? newSelected : newSelected[0] || "");
  };

  const getColumnClass = () => {
    switch (columns) {
      case 1: return "grid-cols-1";
      case 3: return "grid-cols-1 sm:grid-cols-3";
      case 4: return "grid-cols-2 sm:grid-cols-4";
      case 2:
      default: return "grid-cols-2";
    }
  };

  return (
    <div className={`grid ${getColumnClass()} gap-3`}>
      {options.map((option) => {
        const isSelected = selectedValues.includes(option.value);
        
        return (
          <motion.div
            key={option.value}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect(option.value)}
            className={cn(
              "relative cursor-pointer bg-white border-2 rounded-xl p-4 text-center transition-all duration-200",
              isSelected 
                ? "border-primary shadow-md" 
                : "border-gray-200 hover:border-primary/50 hover:shadow-sm"
            )}
          >
            {isSelected && (
              <div className="absolute top-2 right-2 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                <Check className="h-3.5 w-3.5 text-white" />
              </div>
            )}
            
            {option.icon && (
              <div className="flex justify-center items-center h-10 mb-2">
                {option.icon}
              </div>
            )}
            
            <span className="block text-gray-900 font-medium">
              {option.label}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
