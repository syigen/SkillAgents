"use client";

import { AdminSidebar } from "../components/admin-sidebar";
import { AiKeySetupModal } from "@/components/ai/ai-key-setup-modal";
import { useAiKey } from "@/lib/ai/use-ai-key";
import { Key, Loader2, Trash2, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
    const { hasDbKey, hasKey, loading, setSessionKey, saveToDb, clearKey } = useAiKey();
    const [showKeyModal, setShowKeyModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const handleDelete = async () => {
        setDeleting(true);
        setMessage(null);
        try {
            await clearKey();
            setMessage({ type: "success", text: "API key removed successfully" });
        } catch {
            setMessage({ type: "error", text: "Failed to remove key" });
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="flex h-screen bg-[#0f131d] overflow-hidden font-sans">
            <AdminSidebar />

            <div className="flex-1 flex flex-col h-full overflow-hidden border-l border-[#1f2937]">
                {/* Page Header */}
                <div className="shrink-0 px-8 pt-8 pb-2">
                    <h2 className="text-3xl font-bold text-white mb-1">Settings</h2>
                    <p className="text-slate-400 text-sm tracking-wide">
                        Manage your API keys and preferences.
                    </p>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-8 pb-8 pt-6">
                    <div className="max-w-2xl">
                        <div className="bg-[#141a2a] border border-[#1f2937] rounded-xl overflow-hidden">
                            {/* Section Header */}
                            <div className="px-6 py-5 border-b border-[#1f2937]">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-violet-600/5 flex items-center justify-center">
                                        <Key size={20} className="text-violet-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-semibold text-white">Google AI API Key</h3>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            Used for AI-powered criteria and description generation
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Section Body */}
                            <div className="px-6 py-5 space-y-5">
                                {/* Status */}
                                {loading ? (
                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <Loader2 size={14} className="animate-spin" />
                                        Checking key status...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${hasKey ? "bg-emerald-400" : "bg-slate-500"}`} />
                                        <span className={`text-sm font-medium ${hasKey ? "text-emerald-400" : "text-slate-400"}`}>
                                            {hasKey ? "API key is configured" : "No API key configured"}
                                        </span>
                                    </div>
                                )}

                                {/* Message */}
                                {message && (
                                    <div className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm ${message.type === "success"
                                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                            : "bg-red-500/10 border-red-500/20 text-red-400"
                                        }`}>
                                        <CheckCircle2 size={14} />
                                        {message.text}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => { setMessage(null); setShowKeyModal(true); }}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
                                    >
                                        <Key size={14} />
                                        {hasKey ? "Update Key" : "Set Up Key"}
                                    </button>

                                    {hasDbKey && (
                                        <button
                                            onClick={handleDelete}
                                            disabled={deleting}
                                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {deleting ? (
                                                <Loader2 size={14} className="animate-spin" />
                                            ) : (
                                                <Trash2 size={14} />
                                            )}
                                            {deleting ? "Removing..." : "Remove Key"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reuse the same AiKeySetupModal */}
            {showKeyModal && (
                <AiKeySetupModal
                    onClose={() => setShowKeyModal(false)}
                    onSessionKey={(k) => {
                        setSessionKey(k);
                        setShowKeyModal(false);
                        setMessage({ type: "success", text: "API key saved for this session" });
                    }}
                    onDbKey={async (k) => {
                        await saveToDb(k);
                        setShowKeyModal(false);
                        setMessage({ type: "success", text: "API key saved to your account" });
                    }}
                    onSaved={() => { }}
                />
            )}
        </div>
    );
}
