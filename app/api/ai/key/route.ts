import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { encryptKey, decryptKey } from "@/lib/ai/crypto";

/** GET /api/ai/key — check if user has a saved key (never returns the key itself) */
export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const settings = await prisma.userSettings.findUnique({ where: { userId: user.id } });
    const hasKey = !!(settings?.googleAiKeyEnc && settings?.googleAiKeyIv);

    return NextResponse.json({ hasKey });
}

/** POST /api/ai/key — save encrypted key for the authenticated user */
export async function POST(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const key = body?.key?.trim();
    if (!key) {
        return NextResponse.json({ error: "API key is required" }, { status: 400 });
    }

    const { enc, iv } = encryptKey(key);

    await prisma.userSettings.upsert({
        where: { userId: user.id },
        create: { userId: user.id, googleAiKeyEnc: enc, googleAiKeyIv: iv },
        update: { googleAiKeyEnc: enc, googleAiKeyIv: iv },
    });

    return NextResponse.json({ success: true });
}

/** DELETE /api/ai/key — remove saved key from DB */
export async function DELETE() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await prisma.userSettings.updateMany({
        where: { userId: user.id },
        data: { googleAiKeyEnc: null, googleAiKeyIv: null },
    });

    return NextResponse.json({ success: true });
}
