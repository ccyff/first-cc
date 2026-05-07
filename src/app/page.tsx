import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { parseTagsJson } from "@/lib/tags";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const catSlug = sp.cat?.trim();
  const q = sp.q?.trim().toLowerCase() ?? "";

  const [categories, tools, news] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.aiTool.findMany({
      where: {
        ...(catSlug
          ? { category: { slug: catSlug } }
          : {}),
        ...(q
          ? {
              OR: [
                { name: { contains: q } },
                { description: { contains: q } },
                { tagline: { contains: q } },
              ],
            }
          : {}),
      },
      orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
      include: { category: true },
    }),
    prisma.newsArticle.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      take: 5,
    }),
  ]);

  const featured = tools.filter((t) => t.featured).slice(0, 6);
  const list = tools;

  return (
    <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-10">
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-8 glow-border backdrop-blur-md sm:p-12">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-violet-600/25 blur-3xl" />
        <p className="text-xs font-medium uppercase tracking-[0.35em] text-cyan-300/90">
          AI Navigation
        </p>
        <h1 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">
          发现下一代 AI 工具与资讯
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/65 sm:text-base">
          精选对话、编程、图像、语音、搜索与智能体等方向的主流产品。数据由后台维护，可按分类浏览或通过搜索快速定位。
        </p>
        <form
          className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row"
          action="/"
          method="get"
        >
          <input type="hidden" name="cat" value={catSlug ?? ""} />
          <input
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="搜索产品名称或描述…"
            className="flex-1 rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-400/50"
          />
          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 px-6 py-3 text-sm font-semibold text-[#050816] shadow-[0_0_28px_rgba(34,211,238,0.35)] hover:opacity-95"
          >
            搜索
          </button>
        </form>
      </section>

      <section className="mt-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">分类</h2>
            <p className="mt-1 text-sm text-white/50">点选筛选，或结合上方搜索</p>
          </div>
          <Link
            href="/news"
            className="text-sm text-cyan-300/90 hover:text-cyan-200"
          >
            最新资讯 →
          </Link>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={sp.q ? `/?q=${encodeURIComponent(sp.q)}` : "/"}
            className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${
              !catSlug
                ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-100"
                : "border-white/10 text-white/60 hover:border-white/25 hover:text-white"
            }`}
          >
            全部
          </Link>
          {categories.map((c) => {
            const active = c.slug === catSlug;
            const href =
              `/?cat=${encodeURIComponent(c.slug)}` +
              (sp.q ? `&q=${encodeURIComponent(sp.q)}` : "");
            return (
              <Link
                key={c.id}
                href={href}
                className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${
                  active
                    ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-100"
                    : "border-white/10 text-white/60 hover:border-white/25 hover:text-white"
                }`}
              >
                {c.name}
              </Link>
            );
          })}
        </div>
      </section>

      {featured.length > 0 && !q ? (
        <section className="mt-14">
          <h2 className="text-lg font-semibold text-white">编辑推荐</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((t) => (
              <article
                key={t.id}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-cyan-400/30 hover:bg-white/[0.06]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-white">{t.name}</h3>
                    {t.tagline ? (
                      <p className="mt-1 text-xs text-cyan-200/80">{t.tagline}</p>
                    ) : null}
                  </div>
                  <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/45">
                    {t.category?.name ?? "精选"}
                  </span>
                </div>
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-white/55">
                  {t.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {parseTagsJson(t.tags).slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-black/30 px-2 py-0.5 text-[10px] text-white/50"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <a
                  href={t.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex text-sm font-medium text-cyan-300 hover:text-cyan-200"
                >
                  访问官网 ↗
                </a>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-14">
        <h2 className="text-lg font-semibold text-white">
          {q ? "搜索结果" : "全部产品"}
          <span className="ml-2 text-sm font-normal text-white/45">
            {list.length} 项
          </span>
        </h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((t) => (
            <article
              key={t.id}
              className="flex flex-col rounded-xl border border-white/10 bg-black/25 p-4 backdrop-blur-sm transition hover:border-white/20"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-medium text-white">{t.name}</h3>
                <span className="shrink-0 text-[10px] text-white/40">
                  {t.category?.name ?? ""}
                </span>
              </div>
              <p className="mt-2 line-clamp-2 flex-1 text-xs leading-relaxed text-white/55">
                {t.description}
              </p>
              <a
                href={t.url}
                target="_blank"
                rel="noreferrer"
                className="mt-3 text-xs font-medium text-cyan-300 hover:text-cyan-200"
              >
                打开链接
              </a>
            </article>
          ))}
        </div>
        {list.length === 0 ? (
          <p className="mt-8 text-center text-sm text-white/45">
            暂无匹配项，试试其它关键词或分类。
          </p>
        ) : null}
      </section>

      <section className="mt-16 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-white">资讯速递</h2>
          <Link href="/news" className="text-sm text-cyan-300 hover:text-cyan-200">
            更多
          </Link>
        </div>
        <ul className="mt-4 divide-y divide-white/10">
          {news.map((n) => (
            <li key={n.id} className="py-3 first:pt-0">
              <Link
                href={`/news/${n.slug}`}
                className="group block"
              >
                <p className="font-medium text-white group-hover:text-cyan-200">
                  {n.title}
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-white/50">
                  {n.summary}
                </p>
                <p className="mt-2 text-[10px] text-white/35">
                  {n.publishedAt.toLocaleDateString("zh-CN")}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
