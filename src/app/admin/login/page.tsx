import Link from "next/link";
import { loginAction } from "@/lib/auth";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ e?: string }>;
}) {
  const sp = await searchParams;
  const showErr = sp.e === "1";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-100 px-4">
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-lg font-semibold text-zinc-900">后台登录</h1>
        <p className="mt-1 text-sm text-zinc-500">AI Nexus 管理台</p>
        {showErr ? (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            登录失败，请检查邮箱与密码。
          </p>
        ) : null}
        <form action={loginAction} className="mt-6 flex flex-col gap-4">
          <label className="block text-sm text-zinc-700">
            邮箱
            <input
              name="email"
              type="email"
              required
              autoComplete="username"
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500"
              placeholder="admin@example.com"
            />
          </label>
          <label className="block text-sm text-zinc-700">
            密码
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500"
            />
          </label>
          <button
            type="submit"
            className="rounded-md bg-zinc-900 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            登录
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-zinc-500">
          默认账号见种子数据（生产环境请立即修改密码）
        </p>
        <Link
          href="/"
          className="mt-4 block text-center text-sm text-zinc-600 hover:text-zinc-900"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}
