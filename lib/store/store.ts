import { configureStore } from '@reduxjs/toolkit';
import runsReducer from './runsSlice';

export const makeStore = () => {
    return configureStore({
        reducer: {
            runs: runsReducer,
        },
    });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
