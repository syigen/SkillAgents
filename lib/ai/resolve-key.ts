/**
 * lib/ai/resolve-key.ts
 * Server-side helper: resolves the user's AI key from either:
 *   1. X-AI-Key request header (session-only mode)
 *   2. Encrypted DB record for the authenticated user
 *
 * Returns null if no key is available.
 */

import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { decryptKey } from "./crypto";

export async function resolveAiKey(req: Request): Promise<string | null> {
    // 1. Header takes priority (session-only mode)
    const headerKey = req.headers.get("X-AI-Key");
    if (headerKey && headerKey.trim().length > 0) {
        return headerKey.trim();
    }

    // 2. Try DB — requires authenticated user
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const settings = await prisma.userSettings.findUnique({
            where: { userId: user.id },
        });

        if (settings?.googleAiKeyEnc && settings?.googleAiKeyIv) {
            return decryptKey(settings.googleAiKeyEnc, settings.googleAiKeyIv);
        }
    } catch {
        // If DB lookup fails, fall through to null
    }

    return null;
}
