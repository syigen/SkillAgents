'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from './hooks';
import { setRuns } from './runsSlice';

// A component that can be placed in any page/layout to poll statuses of specific runs
export function RunLiveTracker({ runIds }: { runIds: string[] }) {
    const dispatch = useAppDispatch();
    const runs = useAppSelector(state => state.runs.runs);
    const lastChecked = useRef<number>(0);

    useEffect(() => {
        // Initialize redux store with these runs if not already there
        // Only necessary so the store knows about them.
    }, [runIds]);

    useEffect(() => {
        if (!runIds || runIds.length === 0) return;

        // Find runs that are not completed or failed, or we haven't fetched yet
        const fetchStatuses = async () => {
            // we will poll ALL requested runIds just to be safe and keep it simple
            // In a better implementation, we only poll 'running' ones or recently active
            try {
                const now = Date.now();
                if (now - lastChecked.current < 2000) return; // avoid tight loops
                lastChecked.current = now;

                const query = new URLSearchParams({ ids: runIds.join(',') });
                const res = await fetch(`/api/runs/status?${query}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.runs && data.runs.length > 0) {
                        dispatch(setRuns(data.runs));
                    }
                }
            } catch (error) {
                console.error("Polling error:", error);
            }
        };

        fetchStatuses(); // initial fetch
        const intervalId = setInterval(fetchStatuses, 3000); // 3 seconds poll

        return () => clearInterval(intervalId);
    }, [runIds, dispatch]);

    return null; // This is a logic-only component
}
