'use client';

import { CheckCircle2, Activity, CircleDashed } from "lucide-react";
import { FinishInterviewButton } from "./finish-interview-button";
import { EvaluateAllButton } from "./evaluate-all-button";
import { IssueCertificateButton } from "./issue-certificate-button";
import { useAppSelector } from "@/lib/store/hooks";
import { RunLiveTracker } from "@/lib/store/RunLiveTracker";

export function RunStatusActions({
    runId,
    initialStatus,
    isLocked,
    hasCertificate,
    steps,
    criteria,
    skills,
}: any) {
    const liveState = useAppSelector(state => state.runs.runs[runId]);
    const status = liveState?.status ?? initialStatus;
    const locked = liveState?.isLocked ?? isLocked;

    return (
        <div className="flex items-center gap-3">
            <RunLiveTracker runIds={[runId]} />
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-bold tracking-wide uppercase ${status === 'completed' || status === 'pass'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : status === 'fail'
                    ? 'bg-red-500/10 border-red-500/20 text-red-400'
                    : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                }`}>
                {status === 'completed' || status === 'pass' ? <CheckCircle2 size={14} /> : status === 'fail' ? <Activity size={14} /> : <CircleDashed size={14} className="animate-spin-slow" />}
                {status}
            </div>
            {(status === 'running' || status === 'in_progress') && !locked && (
                <>
                    <EvaluateAllButton
                        runId={runId}
                        steps={steps}
                    />
                    <FinishInterviewButton
                        runId={runId}
                        steps={steps}
                        criteria={criteria}
                        skills={skills}
                    />
                </>
            )}
            <IssueCertificateButton runId={runId} isLocked={hasCertificate} status={status} />
        </div>
    );
}
