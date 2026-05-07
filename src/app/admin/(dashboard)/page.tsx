import { prisma } from "@/lib/prisma";

export default async function AdminHomePage() {
  const [tools, news, categories] = await Promise.all([
    prisma.aiTool.count(),
    prisma.newsArticle.count(),
    prisma.category.count(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">概览</h1>
      <p className="mt-1 text-sm text-zinc-500">
        管理 AI 产品、资讯与分类；前台会即时反映更新。
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: "AI 产品", value: tools, href: "/admin/tools" },
          { label: "资讯", value: news, href: "/admin/news" },
          { label: "分类", value: categories, href: "/admin/categories" },
        ].map((c) => (
          <a
            key={c.label}
            href={c.href}
            className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300"
          >
            <p className="text-sm text-zinc-500">{c.label}</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-zinc-900">
              {c.value}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}
