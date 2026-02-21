import { login, signup } from './actions'

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const { message } = await searchParams

    return (
        <div className="flex h-screen w-full items-center justify-center px-4">
            <form className="mx-auto flex w-full max-w-sm flex-col justify-center space-y-6">
                <div className="flex flex-col space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Welcome back
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Enter your email below to authenticate
                    </p>
                </div>

                <div className="flex flex-col space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none" htmlFor="email">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect="off"
                            required
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none" htmlFor="password">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>

                    {message && (
                        <p className="text-sm font-medium text-destructive text-center text-red-500">
                            {message as string}
                        </p>
                    )}

                    <div className="flex gap-2 w-full mt-4">
                        <button
                            formAction={login}
                            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-black text-white hover:bg-gray-800"
                        >
                            Log in
                        </button>
                        <button
                            formAction={signup}
                            className="inline-flex h-10 w-full items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                        >
                            Sign up
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}
