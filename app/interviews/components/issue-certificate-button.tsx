"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Award, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function IssueCertificateButton({
    runId,
    isLocked,
    status
}: {
    runId: string,
    isLocked: boolean,
    status: string
}) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleIssueCertificate = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/runs/${runId}/certificate`, {
                method: "POST",
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to issue certificate");
            }

            if (data.certificate?.id) {
                router.push(`/certificates/${data.certificate.id}`);
            } else {
                router.refresh();
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (isLocked) {
        return (
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md text-sm font-semibold">
                <CheckCircle2 size={16} /> Certified
            </div>
        );
    }

    if (status !== 'pass') {
        return null;
    }

    return (
        <div className="flex flex-col items-end gap-2">
            <Button
                onClick={handleIssueCertificate}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2"
            >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <Award size={16} />}
                Issue Certificate
            </Button>
            {error && <span className="text-red-400 text-xs">{error}</span>}
        </div>
    );
}
