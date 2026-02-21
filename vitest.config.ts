import { defineConfig } from 'vitest/config';
import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';
import { loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    // Load env variables from .env / .env.local into vitest
    const env = loadEnv(mode, process.cwd(), '');

    return {
        plugins: [tsconfigPaths()],
        test: {
            environment: 'node',
            globals: true,
            setupFiles: ['dotenv/config'],
            env
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './'),
            },
        },
    }
});
