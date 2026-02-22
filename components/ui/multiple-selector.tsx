"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface MultipleSelectorProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
    value?: string[];
    onChange?: (value: string[]) => void;
    placeholder?: string;
}

export function MultipleSelector({
    value = [],
    onChange,
    className,
    placeholder,
    ...props
}: MultipleSelectorProps) {
    const [inputValue, setInputValue] = React.useState("");

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (inputValue.trim()) {
                if (!value.includes(inputValue.trim())) {
                    onChange?.([...value, inputValue.trim()]);
                }
                setInputValue("");
            }
        } else if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
            // Optional: remove last item on backspace when input is empty
            e.preventDefault();
            const newItems = [...value];
            newItems.pop();
            onChange?.(newItems);
        }
    };

    const removeItem = (itemToRemove: string) => {
        onChange?.(value.filter((item) => item !== itemToRemove));
    };

    return (
        <div
            className={cn(
                "flex min-h-10 w-full flex-wrap gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 has-focus-visible:outline-none has-focus-visible:ring-2 has-focus-visible:ring-ring has-focus-visible:ring-offset-2",
                className
            )}
        >
            {value.map((item) => (
                <Badge
                    key={item}
                    variant="secondary"
                    className="hover:bg-secondary flex items-center gap-1 pr-1 font-normal text-[#3b82f6] border-[#1e3a8a] bg-[#172554] cursor-default"
                >
                    {item}
                    <button
                        type="button"
                        className="ml-1 rounded-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                removeItem(item);
                            }
                        }}
                        onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                        onClick={() => removeItem(item)}
                    >
                        <X className="h-3 w-3 text-[#3b82f6] hover:text-[#2563eb]" />
                        <span className="sr-only">Remove {item}</span>
                    </button>
                </Badge>
            ))}
            <input
                {...props}
                className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground min-w-[120px]"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={value.length === 0 ? placeholder : ""}
            />
        </div>
    );
}
