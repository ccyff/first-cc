/** 用于 canonical / Open Graph 的站点根地址，部署时请设置 NEXT_PUBLIC_SITE_URL */
export function getMetadataBase(): URL {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw && /^https?:\/\//i.test(raw)) {
    try {
      return new URL(raw);
    } catch {
      /* fall through */
    }
  }
  return new URL("http://localhost:3000");
}

export const seoKeywords = [
  "AI应用",
  "人工智能应用",
  "AI工具导航",
  "AI编程",
  "AI写代码",
  "AI代码助手",
  "AI IDE",
  "Copilot",
  "Cursor",
  "大模型",
  "LLM",
  "AIGC",
  "AI资讯",
  "人工智能资讯",
  "AI行业动态",
  "机器学习",
  "智能体",
  "Agent",
] as const;

export const defaultDescription =
  "AI Nexus 聚焦 AI 应用导航、AI 编程工具（IDE、代码助手、Agent）与 AI 最新资讯，收录对话、图像、语音、自动化与模型基础设施等方向，支持分类检索与长文导读，适合开发者与产品从业者发现优质人工智能工具与趋势。";
