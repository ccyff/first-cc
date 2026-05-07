import Link from "next/link";

export function PublicNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050816]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="group flex items-center gap-2 font-semibold tracking-tight text-white"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 text-sm font-bold text-[#050816] shadow-[0_0_24px_rgba(34,211,238,0.35)]">
            AI
          </span>
          <span className="text-sm uppercase tracking-[0.2em] text-white/80 group-hover:text-white">
            Nexus
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm text-white/70">
          <Link href="/" className="hover:text-cyan-300">
            导航
          </Link>
          <Link href="/news" className="hover:text-cyan-300">
            资讯
          </Link>
          <Link
            href="/admin"
            className="rounded-full border border-white/15 px-3 py-1 text-white/80 hover:border-cyan-400/50 hover:text-cyan-200"
          >
            后台
          </Link>
        </nav>
      </div>
    </header>
  );
}
