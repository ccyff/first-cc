import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { seoKeywords } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await prisma.newsArticle.findFirst({
    where: { slug, published: true },
    select: {
      title: true,
      summary: true,
      publishedAt: true,
    },
  });
  if (!article) {
    return { title: "未找到资讯" };
  }
  const description =
    article.summary.length > 160
      ? `${article.summary.slice(0, 157)}…`
      : article.summary;
  const urlPath = `/news/${slug}`;
  return {
    title: `${article.title}_AI资讯`,
    description,
    keywords: [
      ...seoKeywords,
      "AI深度",
      article.title,
      "人工智能解读",
    ],
    alternates: { canonical: urlPath },
    openGraph: {
      type: "article",
      title: `${article.title} | AI Nexus`,
      description,
      url: urlPath,
      publishedTime: article.publishedAt.toISOString(),
      locale: "zh_CN",
    },
    twitter: {
      card: "summary_large_image",
      title: `${article.title} | AI Nexus`,
      description,
    },
  };
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await prisma.newsArticle.findFirst({
    where: { slug, published: true },
  });
  if (!article) notFound();

  return (
    <article className="relative mx-auto max-w-3xl px-4 pb-20 pt-12">
      <Link href="/news" className="text-sm text-cyan-300 hover:text-cyan-200">
        ← 资讯列表
      </Link>
      <header className="mt-8">
        <h1 className="text-3xl font-semibold leading-tight text-white">
          {article.title}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-cyan-100/70">
          {article.summary}
        </p>
        <p className="mt-4 text-xs text-white/40">
          {article.publishedAt.toLocaleString("zh-CN")}
        </p>
      </header>
      <div className="mt-10 whitespace-pre-wrap text-sm leading-8 text-white/75">
        {article.content}
      </div>
      {article.sourceUrl ? (
        <p className="mt-10 text-sm">
          <span className="text-white/45">参考：</span>
          <a
            href={article.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="text-cyan-300 hover:text-cyan-200"
          >
            {article.sourceUrl}
          </a>
        </p>
      ) : null}
    </article>
  );
}
