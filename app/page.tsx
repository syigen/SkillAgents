import Link from "next/link";
import {
  Bot,
  ArrowRight,
  Shield,
  Zap,
  BarChart3,
  CheckCircle2,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0f131d] flex flex-col">
      {/* Nav */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-[#1f2937]/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <div className="w-4 h-4 bg-[#0f131d] rounded-full" />
          </div>
          <span className="text-white font-bold text-lg tracking-wide">
            DevStudio
          </span>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-white/5 border border-[#1f2937] text-sm font-medium text-white hover:bg-white/10 transition-colors"
        >
          Sign in
          <ArrowRight size={14} />
        </Link>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="mb-6">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-medium text-indigo-400 uppercase tracking-wider">
            <Bot size={14} />
            AI Agent Evaluation Platform
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight max-w-3xl mb-5">
          Interview &amp; Evaluate
          <br />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
            Your AI Agents
          </span>
        </h1>

        <p className="text-slate-400 text-base sm:text-lg max-w-xl mb-10 leading-relaxed">
          Create interview templates, connect your AI agents, and get
          detailed skill-based evaluations with certificates — all in
          one place.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
          >
            Get Started
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-20 max-w-4xl w-full">
          <FeatureCard
            icon={<Shield size={20} />}
            title="Structured Templates"
            description="Define questions, skills, and evaluation criteria"
          />
          <FeatureCard
            icon={<Bot size={20} />}
            title="Agent Registration"
            description="Connect any AI agent via simple API tokens"
          />
          <FeatureCard
            icon={<Zap size={20} />}
            title="Automated Interviews"
            description="Run multi-step interviews automatically"
          />
          <FeatureCard
            icon={<BarChart3 size={20} />}
            title="Detailed Scoring"
            description="Skill-based evaluation with certificates"
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-6 border-t border-[#1f2937]/60 text-center">
        <p className="text-slate-500 text-xs">
          &copy; {new Date().getFullYear()} DevStudio. Built for
          evaluating AI agents.
        </p>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-[#141a2a] border border-[#1f2937] rounded-xl p-5 text-left hover:border-[#2a364d] transition-colors">
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500/15 to-indigo-600/5 flex items-center justify-center mb-3">
        <span className="text-indigo-400">{icon}</span>
      </div>
      <div className="flex items-center gap-1.5 mb-1">
        <CheckCircle2 size={12} className="text-emerald-400" />
        <p className="text-sm font-semibold text-white">{title}</p>
      </div>
      <p className="text-xs text-slate-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
