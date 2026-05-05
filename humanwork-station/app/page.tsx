import Link from "next/link";
import { Bot, Zap, BarChart3, Shield } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 font-bold text-xl">
          <Bot className="h-6 w-6 text-blue-400" />
          HumanWork Station
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-slate-300 hover:text-white transition-colors text-sm">
            ログイン
          </Link>
          <Link
            href="/signup"
            className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            無料で始める
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-5xl mx-auto px-8 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-900/40 border border-blue-700/50 rounded-full px-4 py-1.5 text-sm text-blue-300 mb-8">
          <Zap className="h-3.5 w-3.5" />
          AIエージェントを育てるプラットフォーム
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold leading-tight mb-6">
          AIを<span className="text-blue-400">「使う」</span>場所ではない。
          <br />
          AIに<span className="text-blue-400">「仕事を任せる」</span>場所だ。
        </h1>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
          プロンプトを書く必要なし。エージェントを設計・育成・共有し、
          反復業務から解放されて本質的な仕事に集中する。
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signup"
            className="bg-blue-600 hover:bg-blue-500 px-8 py-3.5 rounded-xl font-semibold text-lg transition-colors"
          >
            無料で始める
          </Link>
          <Link
            href="/login"
            className="border border-slate-600 hover:border-slate-400 px-8 py-3.5 rounded-xl font-semibold text-lg transition-colors text-slate-300 hover:text-white"
          >
            ログイン
          </Link>
        </div>
      </main>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-8 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            icon: Bot,
            title: "言語化不要",
            desc: "プロンプトを書かなくていい。エージェントが既に設計されている",
          },
          {
            icon: BarChart3,
            title: "資産化",
            desc: "エージェント・履歴・改善が積み上がり、組織に最適化されていく",
          },
          {
            icon: Zap,
            title: "育てる体験",
            desc: "使う→反応を見る→編集→再配属。チームが強くなる",
          },
          {
            icon: Shield,
            title: "透明性",
            desc: "エージェントの設計思想を確認でき、安心して任せられる",
          },
        ].map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6"
          >
            <div className="bg-blue-600/20 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
              <Icon className="h-5 w-5 text-blue-400" />
            </div>
            <h3 className="font-semibold text-lg mb-2">{title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
          </div>
        ))}
      </section>

      <footer className="text-center py-8 text-slate-500 text-sm">
        © 2026 HumanWork Station. All rights reserved.
      </footer>
    </div>
  );
}
