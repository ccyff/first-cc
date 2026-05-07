import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { PublicNav } from "@/components/PublicNav";

const space = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Nexus — AI 产品与资讯导航",
  description:
    "聚合主流 AI 工具、模型与行业资讯的导航站，支持后台维护与分类筛选。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${space.variable} ${jetbrains.variable} h-full`}
    >
      <body className="min-h-full antialiased">
        <div className="pointer-events-none fixed inset-0 mesh opacity-80" />
        <div className="relative flex min-h-full flex-col">
          <PublicNav />
          <div className="flex-1">{children}</div>
          <footer className="relative border-t border-white/10 py-10 text-center text-xs text-white/45">
            内容仅供导航与学习参考，请以各产品官方页面为准 · AI Nexus
          </footer>
        </div>
      </body>
    </html>
  );
}
