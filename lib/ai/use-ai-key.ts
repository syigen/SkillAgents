"use client";

import { useState, useEffect, useCallback } from "react";

const SESSION_KEY = "ai_key_session";

export type AiKeyStorage = "session" | "db" | null;

export interface UseAiKeyResult {
    sessionKey: string | null;
    hasDbKey: boolean;
    hasKey: boolean;
    loading: boolean;
    setSessionKey: (key: string) => void;
    saveToDb: (key: string) => Promise<void>;
    clearKey: () => Promise<void>;
    getAuthHeaders: () => Record<string, string>;
}

export function useAiKey(): UseAiKeyResult {
    const [sessionKey, setSessionKeyState] = useState<string | null>(null);
    const [hasDbKey, setHasDbKey] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = typeof window !== "undefined" ? sessionStorage.getItem(SESSION_KEY) : null;
        setSessionKeyState(stored);

        fetch("/api/ai/key")
            .then((r) => r.json())
            .then((data) => setHasDbKey(data.hasKey === true))
            .catch(() => setHasDbKey(false))
            .finally(() => setLoading(false));
    }, []);

    const setSessionKey = useCallback((key: string) => {
        sessionStorage.setItem(SESSION_KEY, key);
        setSessionKeyState(key);
    }, []);

    const saveToDb = useCallback(async (key: string) => {
        const res = await fetch("/api/ai/key", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key }),
        });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error ?? "Failed to save key");
        }
        sessionStorage.setItem(SESSION_KEY, key);
        setSessionKeyState(key);
        setHasDbKey(true);
    }, []);

    const clearKey = useCallback(async () => {
        sessionStorage.removeItem(SESSION_KEY);
        setSessionKeyState(null);
        try {
            await fetch("/api/ai/key", { method: "DELETE" });
            setHasDbKey(false);
        } catch { }
    }, []);

    const getAuthHeaders = useCallback((): Record<string, string> => {
        if (sessionKey) return { "X-AI-Key": sessionKey };
        return {};
    }, [sessionKey]);

    return {
        sessionKey,
        hasDbKey,
        hasKey: !loading && (!!sessionKey || hasDbKey),
        loading,
        setSessionKey,
        saveToDb,
        clearKey,
        getAuthHeaders,
    };
}
