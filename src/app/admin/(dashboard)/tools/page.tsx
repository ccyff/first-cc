import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createTool, deleteTool, updateTool } from "../actions";

function ToolFields({
  categories,
  defaults,
}: {
  categories: { id: string; name: string }[];
  defaults?: {
    name: string;
    slug: string;
    tagline: string | null;
    description: string;
    url: string;
    tags: string;
    featured: boolean;
    sortOrder: number;
    categoryId: string | null;
  };
}) {
  const d = defaults;
  return (
    <>
      <div className="grid gap-2 sm:grid-cols-2">
        <input
          name="name"
          placeholder="名称"
          required
          defaultValue={d?.name}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
        <input
          name="slug"
          placeholder="slug（可空则自动生成）"
          defaultValue={d?.slug}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>
      <input
        name="tagline"
        placeholder="一句话介绍"
        defaultValue={d?.tagline ?? ""}
        className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
      />
      <textarea
        name="description"
        placeholder="描述"
        required
        rows={3}
        defaultValue={d?.description}
        className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
      />
      <input
        name="url"
        placeholder="官网链接 https://"
        required
        defaultValue={d?.url}
        className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
      />
      <div className="grid gap-2 sm:grid-cols-2">
        <select
          name="categoryId"
          defaultValue={d?.categoryId ?? ""}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
        >
          <option value="">未分类</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          name="tags"
          placeholder="标签，用逗号分隔"
          defaultValue={d?.tags}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={d?.featured}
            className="rounded border-zinc-300"
          />
          首页推荐
        </label>
        <label className="flex items-center gap-2">
          排序
          <input
            name="sortOrder"
            type="number"
            defaultValue={d?.sortOrder ?? 0}
            className="w-24 rounded-md border border-zinc-300 px-2 py-1"
          />
        </label>
      </div>
    </>
  );
}

export default async function AdminToolsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; e?: string }>;
}) {
  const { edit, e } = await searchParams;
  const showErr = e === "1";
  const [tools, categories, editing] = await Promise.all([
    prisma.aiTool.findMany({
      orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
      include: { category: true },
    }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    edit
      ? prisma.aiTool.findUnique({ where: { id: edit } })
      : null,
  ]);

  let tagsDisplay = "";
  if (editing) {
    try {
      const arr = JSON.parse(editing.tags) as unknown;
      tagsDisplay = Array.isArray(arr) ? arr.join(", ") : "";
    } catch {
      tagsDisplay = "";
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">AI 产品</h1>
      <p className="mt-1 text-sm text-zinc-500">维护导航站中的产品与外链。</p>

      {showErr ? (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          操作未成功，请检查必填项或 slug 是否重复。
        </p>
      ) : null}

      {editing ? (
        <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-zinc-800">编辑：{editing.name}</p>
            <Link href="/admin/tools" className="text-sm text-zinc-600 hover:text-zinc-900">
              取消编辑
            </Link>
          </div>
          <form action={updateTool.bind(null, editing.id)} className="mt-4 grid gap-3">
            <ToolFields
              categories={categories}
              defaults={{
                name: editing.name,
                slug: editing.slug,
                tagline: editing.tagline,
                description: editing.description,
                url: editing.url,
                tags: tagsDisplay,
                featured: editing.featured,
                sortOrder: editing.sortOrder,
                categoryId: editing.categoryId,
              }}
            />
            <button
              type="submit"
              className="w-fit rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800"
            >
              保存
            </button>
          </form>
        </div>
      ) : null}

      <form action={createTool} className="mt-8 grid max-w-3xl gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-medium text-zinc-800">新建产品</p>
        <ToolFields categories={categories} />
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
              <th className="px-4 py-3">名称</th>
              <th className="px-4 py-3">分类</th>
              <th className="px-4 py-3">推荐</th>
              <th className="px-4 py-3 w-40" />
            </tr>
          </thead>
          <tbody>
            {tools.map((t) => (
              <tr key={t.id} className="border-t border-zinc-100">
                <td className="px-4 py-3">
                  <p className="font-medium text-zinc-900">{t.name}</p>
                  <p className="text-xs text-zinc-500">{t.slug}</p>
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {t.category?.name ?? "—"}
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {t.featured ? "是" : "否"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <Link
                      href={`/admin/tools?edit=${t.id}`}
                      className="text-cyan-700 hover:underline"
                    >
                      编辑
                    </Link>
                    <form action={deleteTool.bind(null, t.id)}>
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
