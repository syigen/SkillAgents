"use client";

import { useState } from "react";
import { Eye, EyeOff, ExternalLink, Key, Database, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AiKeySetupModalProps {
    onSaved: () => void;
    onClose: () => void;
    onSessionKey: (key: string) => void;
    onDbKey: (key: string) => Promise<void>;
}

type StorageChoice = "session" | "db";

export function AiKeySetupModal({ onSaved, onClose, onSessionKey, onDbKey }: AiKeySetupModalProps) {
    const [key, setKey] = useState("");
    const [showKey, setShowKey] = useState(false);
    const [storage, setStorage] = useState<StorageChoice>("session");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSave() {
        const trimmed = key.trim();
        if (!trimmed) {
            setError("Please enter your API key.");
            return;
        }
        if (!trimmed.startsWith("AI")) {
            setError("This doesn't look like a valid Google AI Studio key (should start with 'AI').");
            return;
        }

        setSaving(true);
        setError(null);
        try {
            if (storage === "db") {
                await onDbKey(trimmed);
            } else {
                onSessionKey(trimmed);
            }
            onSaved();
        } catch (err: any) {
            setError(err.message ?? "Failed to save key.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-lg rounded-2xl border border-[#2a364d] bg-[#0f131d] shadow-2xl shadow-black/60 overflow-hidden">
                {/* Header */}
                <div className="px-6 pt-6 pb-4 border-b border-[#1f2937]">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
                            <Key className="h-4 w-4 text-violet-400" />
                        </div>
                        <h2 className="text-lg font-bold text-white">Set Up AI Tools</h2>
                    </div>
                    <p className="text-sm text-slate-400 ml-11">
                        AI features use your personal Google AI Studio key — it stays private to your account.
                    </p>
                </div>

                <div className="px-6 py-5 space-y-5">
                    {/* Step 1 — Get the key */}
                    <div className="rounded-xl border border-[#2a364d] bg-[#151b27] p-4 space-y-3">
                        <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase">Step 1 — Get Your Free Key</p>
                        <ol className="text-sm text-slate-300 space-y-1.5 list-none">
                            <li className="flex gap-2.5"><span className="text-violet-400 font-bold shrink-0">1.</span>Go to <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 underline underline-offset-2 inline-flex items-center gap-1">aistudio.google.com/apikey <ExternalLink className="h-3 w-3" /></a></li>
                            <li className="flex gap-2.5"><span className="text-violet-400 font-bold shrink-0">2.</span>Sign in with your Google account</li>
                            <li className="flex gap-2.5"><span className="text-violet-400 font-bold shrink-0">3.</span>Click <strong className="text-white">"Create API key"</strong></li>
                            <li className="flex gap-2.5"><span className="text-violet-400 font-bold shrink-0">4.</span>Copy the key and paste it below</li>
                        </ol>
                        <div className="text-xs text-slate-500 bg-[#0f131d] rounded-md px-3 py-2 border border-[#1f2937]">
                            ✓ Free tier included &nbsp;·&nbsp; ✓ No credit card required
                        </div>
                    </div>

                    {/* Step 2 — Enter key */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold tracking-widest text-slate-500 uppercase">
                            Step 2 — Paste Your Key
                        </label>
                        <div className="relative">
                            <Input
                                type={showKey ? "text" : "password"}
                                value={key}
                                onChange={(e) => setKey(e.target.value)}
                                placeholder="AIza..."
                                className="bg-[#1b253c]/50 border-[#2a364d] text-slate-200 placeholder:text-slate-600 focus-visible:ring-violet-500 pr-10 rounded-md h-10"
                                autoComplete="off"
                            />
                            <button
                                type="button"
                                onClick={() => setShowKey(!showKey)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                            >
                                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Step 3 — Storage choice */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold tracking-widest text-slate-500 uppercase">
                            Step 3 — How Should We Store It?
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setStorage("session")}
                                className={`flex flex-col items-start gap-1.5 rounded-xl border p-3.5 text-left transition-all ${storage === "session"
                                        ? "border-violet-500/60 bg-violet-600/10 ring-1 ring-violet-500/30"
                                        : "border-[#2a364d] bg-[#151b27] hover:border-[#374563]"
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Clock className={`h-4 w-4 ${storage === "session" ? "text-violet-400" : "text-slate-500"}`} />
                                    <span className="text-sm font-semibold text-white">Session only</span>
                                    {storage === "session" && <CheckCircle2 className="h-3.5 w-3.5 text-violet-400 ml-auto" />}
                                </div>
                                <p className="text-xs text-slate-400">Stays in browser memory. Removed when you close the tab or log out.</p>
                            </button>

                            <button
                                type="button"
                                onClick={() => setStorage("db")}
                                className={`flex flex-col items-start gap-1.5 rounded-xl border p-3.5 text-left transition-all ${storage === "db"
                                        ? "border-violet-500/60 bg-violet-600/10 ring-1 ring-violet-500/30"
                                        : "border-[#2a364d] bg-[#151b27] hover:border-[#374563]"
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Database className={`h-4 w-4 ${storage === "db" ? "text-violet-400" : "text-slate-500"}`} />
                                    <span className="text-sm font-semibold text-white">Save to account</span>
                                    {storage === "db" && <CheckCircle2 className="h-3.5 w-3.5 text-violet-400 ml-auto" />}
                                </div>
                                <p className="text-xs text-slate-400">Encrypted and saved. Available every time you log in.</p>
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-start gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-400">
                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                            {error}
                        </div>
                    )}
                </div>

                {/* Footer actions */}
                <div className="px-6 pb-6 flex gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="flex-1 bg-transparent border-[#2a364d] text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSave}
                        disabled={saving || !key.trim()}
                        className="flex-1 bg-violet-600 hover:bg-violet-500 text-white border-0 font-medium disabled:opacity-50"
                    >
                        {saving ? "Saving..." : storage === "db" ? "Save to Account" : "Use for This Session"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
