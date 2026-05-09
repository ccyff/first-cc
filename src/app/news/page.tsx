import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { seoKeywords } from "@/lib/site";

const newsDescription =
  "AI Nexus 资讯频道：聚合人工智能行业动态、AI 编程实践、大模型与智能体落地、RAG/MCP 工程化与合规科普等深度导读，帮助开发者与产品从业者及时获取 AI 最新资讯与选型参考。";

export const metadata: Metadata = {
  title: "AI最新资讯_人工智能行业动态与AI编程实践",
  description: newsDescription,
  keywords: [
    ...seoKeywords,
    "AI新闻",
    "人工智能头条",
    "大模型动态",
    "AI政策",
    "RAG",
    "MCP",
  ],
  alternates: { canonical: "/news" },
  openGraph: {
    title: "AI最新资讯_人工智能行业动态与AI编程实践 | AI Nexus",
    description: newsDescription,
    url: "/news",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI最新资讯_人工智能行业动态与AI编程实践 | AI Nexus",
    description: newsDescription,
  },
};

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
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/55">
        收录落地实践、工程选型、合规科普与成本治理等主题；每篇正文支持长文阅读与参考链接。内容旨在辅助学习与产品调研，请以原始来源与官方文档为准。
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
