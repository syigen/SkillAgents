import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

export interface RunState {
    id: string;
    status: string;
    score: number | null;
}

interface RunsSliceState {
    runs: Record<string, RunState>; // keyed by run ID
}

const initialState: RunsSliceState = {
    runs: {},
};

export const runsSlice = createSlice({
    name: 'runs',
    initialState,
    reducers: {
        setRuns: (state, action: PayloadAction<RunState[]>) => {
            action.payload.forEach(run => {
                state.runs[run.id] = run;
            });
        },
        updateRunStatus: (state, action: PayloadAction<RunState>) => {
            const { id, status, score } = action.payload;
            if (state.runs[id]) {
                state.runs[id].status = status;
                state.runs[id].score = score;
            } else {
                state.runs[id] = action.payload;
            }
        },
    },
});

export const { setRuns, updateRunStatus } = runsSlice.actions;
export default runsSlice.reducer;
