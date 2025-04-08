import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

export interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
}

export function TagInput({
  value = [],
  onChange,
  placeholder = "タグを入力してEnterを押す",
  maxTags = 10
}: TagInputProps) {
  const [inputValue, setInputValue] = useState<string>("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Enter キーでタグを追加
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      
      // 最大タグ数をチェック
      if (value.length >= maxTags) {
        return;
      }
      
      // 重複をチェック
      if (!value.includes(inputValue.trim())) {
        onChange([...value, inputValue.trim()]);
      }
      
      setInputValue("");
    }
    
    // Backspace キーで最後のタグを削除
    if (e.key === "Backspace" && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="border border-input rounded-md px-3 py-2 focus-within:ring-1 focus-within:ring-ring">
      <div className="flex flex-wrap gap-1.5 mb-1.5">
        {value.map(tag => (
          <Badge 
            key={tag} 
            variant="secondary"
            className="px-2 py-0.5 text-xs font-normal"
          >
            {tag}
            <button
              type="button"
              className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              onClick={() => removeTag(tag)}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remove {tag}</span>
            </button>
          </Badge>
        ))}
      </div>
      <Input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={value.length === 0 ? placeholder : ""}
        className="border-0 p-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 h-auto"
      />
    </div>
  );
}