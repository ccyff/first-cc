import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { PublicNav } from "@/components/PublicNav";
import {
  defaultDescription,
  getMetadataBase,
  seoKeywords,
} from "@/lib/site";

const space = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

const siteTitleDefault =
  "AI应用导航_AI编程工具_AI最新资讯大全 | AI Nexus";

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: siteTitleDefault,
    template: "%s | AI Nexus",
  },
  description: defaultDescription,
  keywords: [...seoKeywords],
  authors: [{ name: "AI Nexus", url: "/" }],
  creator: "AI Nexus",
  publisher: "AI Nexus",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "AI Nexus",
    title: siteTitleDefault,
    description: defaultDescription,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitleDefault,
    description: defaultDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "technology",
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
