import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function NewsIndexPage() {
  const articles = await prisma.newsArticle.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="relative mx-auto max-w-3xl px-4 pb-20 pt-12">
      <Link href="/" className="text-sm text-cyan-300 hover:text-cyan-200">
        ← 返回导航
      </Link>
      <h1 className="mt-6 text-3xl font-semibold text-white">AI 资讯</h1>
      <p className="mt-2 text-sm text-white/55">
        行业观察与产品趋势摘要，正文可在详情页阅读。
      </p>
      <ul className="mt-10 space-y-6">
        {articles.map((a) => (
          <li key={a.id}>
            <Link
              href={`/news/${a.slug}`}
              className="group block rounded-xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-cyan-400/30"
            >
              <h2 className="text-lg font-medium text-white group-hover:text-cyan-200">
                {a.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-white/55">
                {a.summary}
              </p>
              <p className="mt-3 text-xs text-white/35">
                {a.publishedAt.toLocaleDateString("zh-CN")}
              </p>
            </Link>
          </li>
        ))}
      </ul>
      {articles.length === 0 ? (
        <p className="mt-12 text-center text-sm text-white/45">暂无资讯。</p>
      ) : null}
    </div>
  );
}
