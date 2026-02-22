import { resetPassword } from './actions'
import Link from 'next/link'
import { ArrowRight, Mail, ArrowLeft } from 'lucide-react'

export default async function ForgotPasswordPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const { message } = await searchParams

    return (
        <div className="min-h-screen bg-[#0f131d] flex">
            {/* Left panel — branding */}
            <div className="hidden lg:flex lg:w-[480px] xl:w-[560px] flex-col justify-between p-10 border-r border-[#1f2937]/60 bg-gradient-to-b from-[#0f131d] to-[#111827]">
                <div>
                    <Link href="/" className="flex items-center gap-3 group">
                        <img src="/logo-white.svg" alt="SkillAgents" className="w-8 h-8" />
                        <span className="text-white font-bold text-lg tracking-wide">SkillAgents</span>
                    </Link>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-white leading-snug mb-3">
                        Forgot your password?
                        <br />
                        <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                            No worries.
                        </span>
                    </h2>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                        Enter your email and we&apos;ll send you a link to reset your password.
                    </p>
                </div>

                <p className="text-slate-600 text-xs">
                    &copy; {new Date().getFullYear()} SkillAgents
                </p>
            </div>

            {/* Right panel — form */}
            <div className="flex-1 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-[400px]">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-3 mb-10">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                <div className="w-4 h-4 bg-[#0f131d] rounded-full" />
                            </div>
                            <span className="text-white font-bold text-lg tracking-wide">SkillAgents</span>
                        </Link>
                    </div>

                    {/* Back to login */}
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors mb-8"
                    >
                        <ArrowLeft size={12} />
                        Back to sign in
                    </Link>

                    <h1 className="text-2xl font-bold text-white mb-1">Reset password</h1>
                    <p className="text-sm text-slate-400 mb-8">
                        Enter your email to receive a password reset link
                    </p>

                    {message && (
                        <div className={`mb-6 px-4 py-3 rounded-lg border text-sm ${(message as string).toLowerCase().includes('check')
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : 'bg-red-500/10 border-red-500/20 text-red-400'
                            }`}>
                            {message as string}
                        </div>
                    )}

                    <form className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-300 uppercase tracking-wider" htmlFor="email">
                                Email address
                            </label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    autoCorrect="off"
                                    required
                                    className="w-full h-11 pl-10 pr-4 rounded-lg bg-[#141a2a] border border-[#1f2937] text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 transition-all"
                                />
                            </div>
                        </div>

                        <button
                            formAction={resetPassword}
                            className="w-full h-11 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                        >
                            Send reset link
                            <ArrowRight size={16} />
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-500 mt-8">
                        Remember your password?{' '}
                        <Link
                            href="/login"
                            className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
