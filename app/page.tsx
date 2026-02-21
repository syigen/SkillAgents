import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signout } from "@/app/login/actions";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />

        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left mt-10">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Welcome to the App
          </h1>

          {user ? (
            <div className="flex flex-col gap-4 bg-gray-100 p-6 rounded-lg dark:bg-gray-900">
              <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
                You are logged in as <span className="font-semibold text-black dark:text-white">{user.email}</span>
              </p>
              <form action={signout}>
                <button
                  type="submit"
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-red-600 px-5 text-white transition-colors hover:bg-red-700 md:w-auto"
                >
                  Sign Out
                </button>
              </form>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
                You are not logged in.
              </p>
              <Link
                href="/login"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-black px-5 text-white transition-colors hover:bg-[#383838] dark:bg-white dark:text-black dark:hover:bg-[#ccc] md:w-[158px]"
              >
                Go to Login
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
