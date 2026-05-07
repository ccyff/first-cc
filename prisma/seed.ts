import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function tagsJson(tags: string[]) {
  return JSON.stringify(tags);
}

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  await prisma.adminUser.upsert({
    where: { email: "admin@example.com" },
    update: { passwordHash },
    create: { email: "admin@example.com", passwordHash },
  });

  const categories = [
    { name: "对话与助手", slug: "chat-assistants", sortOrder: 10 },
    { name: "编程与 IDE", slug: "coding-ide", sortOrder: 20 },
    { name: "图像与视频", slug: "image-video", sortOrder: 30 },
    { name: "语音与音频", slug: "audio", sortOrder: 40 },
    { name: "搜索与研究", slug: "search-research", sortOrder: 50 },
    { name: "自动化与智能体", slug: "agents", sortOrder: 60 },
    { name: "模型与基础设施", slug: "models-infra", sortOrder: 70 },
  ];

  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, sortOrder: c.sortOrder },
      create: c,
    });
  }

  const cat = await prisma.category.findMany();
  const bySlug = Object.fromEntries(cat.map((x) => [x.slug, x.id]));

  const tools: Array<{
    name: string;
    slug: string;
    tagline?: string;
    description: string;
    url: string;
    categorySlug?: string;
    tags: string[];
    featured?: boolean;
    sortOrder?: number;
  }> = [
    {
      name: "ChatGPT",
      slug: "chatgpt",
      tagline: "多模态对话与工作流",
      description: "OpenAI 旗舰对话模型与插件生态，适合写作、分析与日常自动化。",
      url: "https://chat.openai.com",
      categorySlug: "chat-assistants",
      tags: ["LLM", "多模态", "插件"],
      featured: true,
      sortOrder: 10,
    },
    {
      name: "Claude",
      slug: "claude",
      tagline: "长上下文与严谨推理",
      description: "Anthropic 系列模型，擅长长文档、代码与结构化输出。",
      url: "https://claude.ai",
      categorySlug: "chat-assistants",
      tags: ["LLM", "长上下文"],
      featured: true,
      sortOrder: 20,
    },
    {
      name: "Google Gemini",
      slug: "gemini",
      tagline: "谷歌多模态全家桶",
      description: "与 Google 搜索、Workspace 深度整合的多模态模型与 API。",
      url: "https://gemini.google.com",
      categorySlug: "chat-assistants",
      tags: ["多模态", "搜索"],
      featured: true,
      sortOrder: 30,
    },
    {
      name: "Cursor",
      slug: "cursor",
      tagline: "AI 原生代码编辑器",
      description: "基于 VS Code 的 AI 编程环境，支持代理模式与代码库级理解。",
      url: "https://cursor.com",
      categorySlug: "coding-ide",
      tags: ["IDE", "编程"],
      featured: true,
      sortOrder: 10,
    },
    {
      name: "GitHub Copilot",
      slug: "github-copilot",
      tagline: "编辑器内联补全",
      description: "在 VS Code、JetBrains 等环境中提供实时代码建议与聊天。",
      url: "https://github.com/features/copilot",
      categorySlug: "coding-ide",
      tags: ["IDE", "补全"],
      sortOrder: 20,
    },
    {
      name: "Windsurf",
      slug: "windsurf",
      tagline: "Codeium 出品 AI IDE",
      description: "强调代理式开发与深度代码库协作的新一代编辑器。",
      url: "https://windsurf.com",
      categorySlug: "coding-ide",
      tags: ["IDE", "Agent"],
      sortOrder: 30,
    },
    {
      name: "Midjourney",
      slug: "midjourney",
      tagline: "高质量图像生成",
      description: "以美学与风格化见长的文生图社区与订阅服务。",
      url: "https://www.midjourney.com",
      categorySlug: "image-video",
      tags: ["文生图"],
      sortOrder: 10,
    },
    {
      name: "Runway",
      slug: "runway",
      tagline: "视频与创意工具",
      description: "AI 视频编辑、生成与特效的一站式创意套件。",
      url: "https://runwayml.com",
      categorySlug: "image-video",
      tags: ["视频", "创意"],
      sortOrder: 20,
    },
    {
      name: "ElevenLabs",
      slug: "elevenlabs",
      tagline: "语音合成与克隆",
      description: "自然度较高的 TTS、语音克隆与多语言语音 API。",
      url: "https://elevenlabs.io",
      categorySlug: "audio",
      tags: ["TTS", "语音"],
      sortOrder: 10,
    },
    {
      name: "Perplexity",
      slug: "perplexity",
      tagline: "带引用的研究型搜索",
      description: "结合实时检索与摘要的答案引擎，适合调研与事实核对。",
      url: "https://www.perplexity.ai",
      categorySlug: "search-research",
      tags: ["搜索", "引用"],
      featured: true,
      sortOrder: 10,
    },
    {
      name: "n8n",
      slug: "n8n",
      tagline: "可视化工作流",
      description: "开源自动化平台，可编排 API、数据库与 AI 节点。",
      url: "https://n8n.io",
      categorySlug: "agents",
      tags: ["自动化", "工作流"],
      sortOrder: 10,
    },
    {
      name: "Hugging Face",
      slug: "huggingface",
      tagline: "模型与数据集社区",
      description: "托管模型权重、Spaces 演示与训练基础设施的开源枢纽。",
      url: "https://huggingface.co",
      categorySlug: "models-infra",
      tags: ["开源", "模型"],
      featured: true,
      sortOrder: 10,
    },
  ];

  for (const t of tools) {
    await prisma.aiTool.upsert({
      where: { slug: t.slug },
      update: {
        name: t.name,
        tagline: t.tagline,
        description: t.description,
        url: t.url,
        tags: tagsJson(t.tags),
        featured: t.featured ?? false,
        sortOrder: t.sortOrder ?? 0,
        categoryId: t.categorySlug ? bySlug[t.categorySlug] : null,
      },
      create: {
        name: t.name,
        slug: t.slug,
        tagline: t.tagline,
        description: t.description,
        url: t.url,
        tags: tagsJson(t.tags),
        featured: t.featured ?? false,
        sortOrder: t.sortOrder ?? 0,
        categoryId: t.categorySlug ? bySlug[t.categorySlug] : null,
      },
    });
  }

  const news = [
    {
      title: "多模态大模型在办公场景落地的五个趋势",
      slug: "multimodal-office-trends",
      summary: "从文档理解到实时会议摘要，企业正在把模型嵌入日常协作链路。",
      content:
        "1) 长上下文降低「复制粘贴」成本。\n2) 工具调用让模型能查日历、发邮件。\n3) 私有化与审计需求推动混合部署。\n4) 评测从「体感」走向可重复基准。\n5) 人机协同界面成为差异化关键。\n\n本站内容仅供导航与学习参考，请以各产品官方说明为准。",
      sourceUrl: "https://www.anthropic.com",
      publishedAt: new Date(),
    },
    {
      title: "AI 编程工具：从补全到代理的演进",
      slug: "ai-coding-agents",
      summary: "IDE 集成、代码库索引与沙箱执行正在重塑开发者工作流。",
      content:
        "补全类工具强调低延迟与本地隐私；代理类工具强调任务分解与可验证步骤。团队选型时可关注：是否支持 monorepo、是否可接入私有模型、以及审计与合规策略。\n\n定期关注各工具发行说明与安全公告。",
      sourceUrl: "https://github.com",
      publishedAt: new Date(Date.now() - 86400000),
    },
  ];

  for (const n of news) {
    await prisma.newsArticle.upsert({
      where: { slug: n.slug },
      update: {
        title: n.title,
        summary: n.summary,
        content: n.content,
        sourceUrl: n.sourceUrl,
        publishedAt: n.publishedAt,
      },
      create: {
        title: n.title,
        slug: n.slug,
        summary: n.summary,
        content: n.content,
        sourceUrl: n.sourceUrl,
        publishedAt: n.publishedAt,
      },
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
