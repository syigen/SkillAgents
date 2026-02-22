"use client";

import { Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AiGenerateButtonProps {
    onClick: () => void;
    loading?: boolean;
    label?: string;
    variant?: "button" | "inline";
    className?: string;
}

/**
 * Reusable AI generation trigger button.
 * Use variant="button" for standalone buttons, variant="inline" for small inline triggers.
 */
export function AiGenerateButton({
    onClick,
    loading = false,
    label = "Generate with AI",
    variant = "button",
    className,
}: AiGenerateButtonProps) {
    if (variant === "inline") {
        return (
            <button
                type="button"
                onClick={onClick}
                disabled={loading}
                className={cn(
                    "flex items-center gap-1.5 text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                    className
                )}
            >
                {loading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                    <Sparkles className="h-3 w-3" />
                )}
                {loading ? "Generating..." : label}
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={loading}
            className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-md border border-violet-500/40 bg-violet-600/10 text-violet-300 hover:bg-violet-600/20 hover:text-violet-200 hover:border-violet-400/60 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm",
                className
            )}
        >
            {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Sparkles className="h-4 w-4" />
            )}
            {loading ? "Generating..." : label}
        </button>
    );
}
