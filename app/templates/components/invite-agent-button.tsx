"use client";

import { useState } from "react";
import { Copy, Check, Bot, X } from "lucide-react";

interface InviteAgentButtonProps {
    templateId: string;
}

export function InviteAgentButton({ templateId }: InviteAgentButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [inviteData, setInviteData] = useState<{ token: string; prompt: string } | null>(null);
    const [copiedToken, setCopiedToken] = useState(false);
    const [copiedPrompt, setCopiedPrompt] = useState(false);

    const generateInvite = async () => {
        setIsLoading(true);
        // Clear old data if regenerating
        setInviteData(null);
        setCopiedToken(false);
        setCopiedPrompt(false);

        try {
            const res = await fetch('/api/agents/invite-prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ template_id: templateId }),
            });

            if (!res.ok) {
                console.error("Failed to generate invite:", await res.text());
                return;
            }

            const data = await res.json();
            setInviteData(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpen = () => {
        setIsOpen(true);
        if (!inviteData) {
            generateInvite();
        }
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    const copyToClipboard = async (text: string, type: 'token' | 'prompt') => {
        try {
            await navigator.clipboard.writeText(text);
            if (type === 'token') {
                setCopiedToken(true);
                setTimeout(() => setCopiedToken(false), 2000);
            } else {
                setCopiedPrompt(true);
                setTimeout(() => setCopiedPrompt(false), 2000);
            }
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    return (
        <>
            <button
                onClick={handleOpen}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-md font-medium transition-all shadow-md shadow-indigo-900/20 flex items-center justify-center gap-2 text-sm tracking-wide"
            >
                <Bot size={16} /> Invite Agent
            </button>

            {/* Modal Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    {/* Modal Content */}
                    <div className="bg-[#0f131d] border border-[#2a364d] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a364d] bg-[#151b27]">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                                    <Bot size={18} />
                                </div>
                                <h3 className="text-lg font-bold text-white tracking-wide">Invite AI Agent</h3>
                            </div>
                            <button
                                onClick={handleClose}
                                className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-[#1b253c]/50"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-4">
                                    <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                                    <p className="text-slate-400 font-medium text-sm animate-pulse">Generating secure invite token...</p>
                                </div>
                            ) : inviteData ? (
                                <div className="space-y-6">
                                    <p className="text-slate-300 text-sm leading-relaxed">
                                        Use this invite token to allow an external AI agent to register and begin this evaluation. Each token tracks usage and analytics.
                                    </p>

                                    {/* Token Field */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Secure Token</label>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 bg-[#1b253c]/50 border border-[#2a364d] rounded-md px-4 py-2.5 font-mono text-sm text-indigo-300 truncate select-all">
                                                {inviteData.token}
                                            </div>
                                            <button
                                                onClick={() => copyToClipboard(inviteData.token, 'token')}
                                                className="shrink-0 flex items-center justify-center gap-1.5 bg-[#1b253c] hover:bg-[#2a364d] border border-[#2a364d] text-slate-300 px-3 py-2.5 rounded-md transition-colors"
                                                title="Copy Token"
                                            >
                                                {copiedToken ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Action Prompt Field */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Agent Instructions</label>
                                        <div className="relative group">
                                            <textarea
                                                readOnly
                                                value={inviteData.prompt}
                                                className="w-full h-32 bg-[#1b253c]/50 border border-[#2a364d] rounded-md p-4 font-mono text-xs text-slate-400 leading-relaxed resize-none focus:outline-none focus:border-indigo-500/50"
                                            />
                                            <button
                                                onClick={() => copyToClipboard(inviteData.prompt, 'prompt')}
                                                className="absolute top-2 right-2 p-2 bg-[#0f131d] border border-[#2a364d] rounded-md text-slate-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100 shadow-lg"
                                                title="Copy Instructions"
                                            >
                                                {copiedPrompt ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                                            </button>
                                        </div>
                                        <p className="text-[11px] text-slate-500">
                                            Copy and paste these exact instructions into the AI agent's system prompt to initiate the run.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-red-400 text-sm">Failed to load invite data. Please try again.</p>
                                    <button onClick={generateInvite} className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm font-medium underline">
                                        Retry Generation
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {inviteData && !isLoading && (
                            <div className="px-6 py-4 border-t border-[#2a364d] bg-[#151b27] flex justify-between items-center">
                                <button
                                    onClick={generateInvite}
                                    className="text-slate-400 hover:text-slate-300 text-sm font-medium transition-colors"
                                >
                                    Generate New Token
                                </button>
                                <button
                                    onClick={handleClose}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md font-medium transition-colors text-sm"
                                >
                                    Done
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
