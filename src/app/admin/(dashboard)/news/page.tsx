import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createNews, deleteNews, updateNews } from "../actions";

export default async function AdminNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; e?: string }>;
}) {
  const { edit, e } = await searchParams;
  const showErr = e === "1";
  const [articles, editing] = await Promise.all([
    prisma.newsArticle.findMany({
      orderBy: { publishedAt: "desc" },
    }),
    edit ? prisma.newsArticle.findUnique({ where: { id: edit } }) : null,
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">资讯</h1>
      <p className="mt-1 text-sm text-zinc-500">前台资讯列表与详情正文。</p>

      {showErr ? (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          操作未成功，请检查必填项或 slug 是否重复。
        </p>
      ) : null}

      {editing ? (
        <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-zinc-800">编辑资讯</p>
            <Link href="/admin/news" className="text-sm text-zinc-600 hover:text-zinc-900">
              取消编辑
            </Link>
          </div>
          <form action={updateNews.bind(null, editing.id)} className="mt-4 grid gap-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                name="title"
                placeholder="标题"
                required
                defaultValue={editing.title}
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
              />
              <input
                name="slug"
                placeholder="slug"
                defaultValue={editing.slug}
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
            <textarea
              name="summary"
              placeholder="摘要"
              required
              rows={2}
              defaultValue={editing.summary}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
            <textarea
              name="content"
              placeholder="正文"
              required
              rows={8}
              defaultValue={editing.content}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
            <input
              name="sourceUrl"
              placeholder="来源链接（可选）"
              defaultValue={editing.sourceUrl ?? ""}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="published"
                defaultChecked={editing.published}
                className="rounded border-zinc-300"
              />
              已发布
            </label>
            <button
              type="submit"
              className="w-fit rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800"
            >
              保存
            </button>
          </form>
        </div>
      ) : null}

      <form action={createNews} className="mt-8 grid max-w-3xl gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-medium text-zinc-800">新建资讯</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            name="title"
            placeholder="标题"
            required
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
          <input
            name="slug"
            placeholder="slug（可空则自动生成）"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>
        <textarea
          name="summary"
          placeholder="摘要"
          required
          rows={2}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
        <textarea
          name="content"
          placeholder="正文"
          required
          rows={8}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
        <input
          name="sourceUrl"
          placeholder="来源链接（可选）"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="published"
            defaultChecked
            className="rounded border-zinc-300"
          />
          已发布
        </label>
        <button
          type="submit"
          className="w-fit rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800"
        >
          添加
        </button>
      </form>

      <div className="mt-8 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">标题</th>
              <th className="px-4 py-3">发布</th>
              <th className="px-4 py-3 w-40" />
            </tr>
          </thead>
          <tbody>
            {articles.map((a) => (
              <tr key={a.id} className="border-t border-zinc-100">
                <td className="px-4 py-3">
                  <p className="font-medium text-zinc-900">{a.title}</p>
                  <p className="text-xs text-zinc-500">{a.slug}</p>
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {a.published ? "是" : "否"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <Link
                      href={`/admin/news?edit=${a.id}`}
                      className="text-cyan-700 hover:underline"
                    >
                      编辑
                    </Link>
                    <form action={deleteNews.bind(null, a.id)}>
                      <button
                        type="submit"
                        className="text-red-600 hover:underline"
                      >
                        删除
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
