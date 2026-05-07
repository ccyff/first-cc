import Link from "next/link";
import { logoutAction } from "@/lib/auth";

const links = [
  { href: "/admin", label: "概览" },
  { href: "/admin/tools", label: "AI 产品" },
  { href: "/admin/news", label: "资讯" },
  { href: "/admin/categories", label: "分类" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-zinc-100 text-zinc-900">
      <aside className="flex w-52 flex-col border-r border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 px-4 py-4">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            管理后台
          </p>
          <p className="text-sm font-semibold text-zinc-900">AI Nexus</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-zinc-200 p-2">
          <Link
            href="/"
            className="block rounded-md px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
          >
            查看站点
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="mt-1 w-full rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
            >
              退出登录
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
