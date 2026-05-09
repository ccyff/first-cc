import { prisma } from "@/lib/prisma";
import { createCategory, deleteCategory } from "../actions";

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ e?: string }>;
}) {
  const sp = await searchParams;
  const showErr = sp.e === "1";

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">分类</h1>
      <p className="mt-1 text-sm text-zinc-500">用于前台筛选与后台归类。</p>

      {showErr ? (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          操作未成功，请检查必填项或 slug 是否重复。
        </p>
      ) : null}

      <form action={createCategory} className="mt-8 grid max-w-xl gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-medium text-zinc-800">新建分类</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            name="name"
            placeholder="名称"
            required
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
          <input
            name="slug"
            placeholder="slug（可空则自动生成）"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>
        <input
          name="sortOrder"
          type="number"
          placeholder="排序（数字越小越靠前）"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          defaultValue={0}
        />
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
              <th className="px-4 py-3">slug</th>
              <th className="px-4 py-3">排序</th>
              <th className="px-4 py-3 w-24" />
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-t border-zinc-100">
                <td className="px-4 py-3 font-medium text-zinc-900">
                  {c.name}
                </td>
                <td className="px-4 py-3 text-zinc-600">{c.slug}</td>
                <td className="px-4 py-3 text-zinc-600">{c.sortOrder}</td>
                <td className="px-4 py-3">
                  <form action={deleteCategory.bind(null, c.id)}>
                    <button
                      type="submit"
                      className="text-red-600 hover:underline"
                    >
                      删除
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
