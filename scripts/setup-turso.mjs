/**
 * 一键初始化 Turso 数据库：建表 + 导入种子数据
 *
 * 用法: TURSO_DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... node scripts/setup-turso.mjs
 */
import { createClient } from "@libsql/client";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

const url = process.env.TURSO_DATABASE_URL;
const token = process.env.TURSO_AUTH_TOKEN;
if (!url) { console.error("❌ 请设置 TURSO_DATABASE_URL"); process.exit(1); }

// ── 1. 建表 ──────────────────────────────────────────────
const raw = createClient({ url, authToken: token });

console.log("正在创建表…");
await raw.execute(`CREATE TABLE IF NOT EXISTS AdminUser        (id TEXT NOT NULL PRIMARY KEY, email TEXT NOT NULL UNIQUE, passwordHash TEXT NOT NULL, createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
await raw.execute(`CREATE TABLE IF NOT EXISTS Category        (id TEXT NOT NULL PRIMARY KEY, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, sortOrder INTEGER NOT NULL DEFAULT 0)`);
await raw.execute(`CREATE TABLE IF NOT EXISTS AiTool          (id TEXT NOT NULL PRIMARY KEY, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, tagline TEXT, description TEXT NOT NULL, url TEXT NOT NULL, logoUrl TEXT, tags TEXT NOT NULL DEFAULT '[]', featured INTEGER NOT NULL DEFAULT 0, sortOrder INTEGER NOT NULL DEFAULT 0, categoryId TEXT, createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (categoryId) REFERENCES Category(id) ON DELETE SET NULL)`);
await raw.execute(`CREATE TABLE IF NOT EXISTS NewsArticle     (id TEXT NOT NULL PRIMARY KEY, title TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, summary TEXT NOT NULL, content TEXT NOT NULL, sourceUrl TEXT, imageUrl TEXT, published INTEGER NOT NULL DEFAULT 1, publishedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
raw.close();
console.log("✅ 表创建完成");

// ── 2. 种子数据 ──────────────────────────────────────────
const adapter = new PrismaLibSQL({ url, authToken: token });
const prisma = new PrismaClient({ adapter });
const bcrypt = (await import("bcryptjs")).default;

// 2a. 管理员
const passwordHash = await bcrypt.hash("admin123", 10);
await prisma.adminUser.upsert({
  where: { email: "admin@example.com" },
  update: { passwordHash },
  create: { email: "admin@example.com", passwordHash },
});

// 2b. 分类
const categoryData = [
  { name: "对话与助手", slug: "chat-assistants", sortOrder: 10 },
  { name: "写作与文档", slug: "writing-docs", sortOrder: 15 },
  { name: "编程与 IDE", slug: "coding-ide", sortOrder: 20 },
  { name: "低代码与产品原型", slug: "low-code", sortOrder: 25 },
  { name: "图像与视频", slug: "image-video", sortOrder: 30 },
  { name: "语音与音频", slug: "audio", sortOrder: 40 },
  { name: "搜索与研究", slug: "search-research", sortOrder: 50 },
  { name: "自动化与智能体", slug: "agents", sortOrder: 60 },
  { name: "模型与基础设施", slug: "models-infra", sortOrder: 70 },
  { name: "数据与分析", slug: "data-analytics", sortOrder: 80 },
];
for (const c of categoryData) {
  await prisma.category.upsert({
    where: { slug: c.slug }, update: c, create: c,
  });
}
const cats = await prisma.category.findMany();
const bySlug = Object.fromEntries(cats.map((x) => [x.slug, x.id]));

// 2c. 工具
const tools = [
  { name: "ChatGPT", slug: "chatgpt", tagline: "多模态对话与工作流", description: "OpenAI 旗下的旗舰对话与推理产品，覆盖文本、图像与语音等多模态能力，并支持自定义 GPTs、联网检索与第三方插件生态。适合写作润色、代码解释、学习辅导与日常办公自动化。企业场景可关注数据留存策略、访问控制与模型版本更新节奏。", url: "https://chat.openai.com", categorySlug: "chat-assistants", tags: ["LLM", "多模态", "插件"], featured: true, sortOrder: 10 },
  { name: "Claude", slug: "claude", tagline: "长上下文与严谨推理", description: "Anthropic 推出的 Claude 系列以长上下文窗口与更稳健的指令遵循见长，适合长文档总结、复杂表格理解、代码审查与结构化输出（如 JSON / 大纲）。Claude Code 等工具进一步把能力延伸到终端与代码库级任务。", url: "https://claude.ai", categorySlug: "chat-assistants", tags: ["LLM", "长上下文", "代码"], featured: true, sortOrder: 20 },
  { name: "Google Gemini", slug: "gemini", tagline: "谷歌多模态与 Workspace 协同", description: "Gemini 深度整合 Google 搜索、Gmail、Docs 等 Workspace 能力，强调实时信息与多模态理解。开发者可通过 Google AI Studio / Vertex AI 接入 API，适合需要检索增强与谷歌生态打通的团队。", url: "https://gemini.google.com", categorySlug: "chat-assistants", tags: ["多模态", "搜索", "API"], featured: true, sortOrder: 30 },
  { name: "Microsoft Copilot", slug: "microsoft-copilot", tagline: "Windows 与 Microsoft 365 里的 AI 助手", description: "嵌入 Windows、Edge、Office 的 Copilot 体验，支持文档起草、邮件摘要、会议要点与网页侧栏问答。适合已使用微软生态的组织做渐进式落地，同时需关注租户策略与合规配置。", url: "https://copilot.microsoft.com", categorySlug: "chat-assistants", tags: ["办公", "微软", "助手"], sortOrder: 40 },
  { name: "DeepSeek", slug: "deepseek", tagline: "高性价比推理与代码模型", description: "国产开源与商用并行的模型路线，在数学、代码与中文场景有较强表现，API 定价相对友好。适合需要自建应用、批量推理或对比评测的团队，建议结合官方文档关注上下文长度与工具调用能力。", url: "https://www.deepseek.com", categorySlug: "chat-assistants", tags: ["国产", "API", "代码"], featured: true, sortOrder: 50 },
  { name: "通义千问", slug: "tongyi-qianwen", tagline: "阿里云大模型与行业方案", description: "面向企业与开发者的中文大模型品牌，提供网页对话、开放 API 与行业解决方案，并与阿里云产品打通。适合已上云、需要国内合规与本地化支持的业务场景。", url: "https://tongyi.aliyun.com", categorySlug: "chat-assistants", tags: ["国产", "企业", "阿里云"], sortOrder: 60 },
  { name: "Kimi（月之暗面）", slug: "kimi-moonshot", tagline: "长文本与中文检索体验", description: "强调超长上下文与中文资料阅读体验，适合论文、合同、研报等长文档的快速摘要与对比。可作为研究、法务与内容团队的辅助阅读工具，具体能力以官方最新说明为准。", url: "https://kimi.moonshot.cn", categorySlug: "chat-assistants", tags: ["长文本", "中文", "阅读"], sortOrder: 70 },
  { name: "Notion AI", slug: "notion-ai", tagline: "知识库内的写作与总结", description: "直接在 Notion 页面中生成摘要、续写、翻译与行动项提取，减少在笔记工具与聊天窗口之间来回切换。适合以 Notion 作为团队知识中枢的中小团队，注意权限与内容可见性设置。", url: "https://www.notion.so/product/ai", categorySlug: "writing-docs", tags: ["笔记", "协作", "写作"], sortOrder: 10 },
  { name: "Gamma", slug: "gamma", tagline: "AI 生成演示文稿与网页", description: "通过提示词快速生成演示结构、配图建议与排版样式，适合市场、运营与培训场景的快速出稿。可与品牌模板结合，缩短从大纲到可演示版本的时间。", url: "https://gamma.app", categorySlug: "writing-docs", tags: ["演示", "设计", "内容"], sortOrder: 20 },
  { name: "Cursor", slug: "cursor", tagline: "AI 原生代码编辑器", description: "基于 VS Code 的 AI 编程环境，支持代码库索引、内联编辑与代理式多步任务。适合全栈与客户端开发者在日常迭代中减少样板代码与调试时间，建议配合代码审查与测试策略使用。", url: "https://cursor.com", categorySlug: "coding-ide", tags: ["IDE", "Agent", "编程"], featured: true, sortOrder: 10 },
  { name: "GitHub Copilot", slug: "github-copilot", tagline: "编辑器内联补全与聊天", description: "在 VS Code、JetBrains、Vim 等环境中提供实时代码补全、聊天与拉取请求摘要。与 GitHub 工作流天然整合，企业版支持策略与审计，适合已有 GitHub 生态的团队。", url: "https://github.com/features/copilot", categorySlug: "coding-ide", tags: ["IDE", "补全", "GitHub"], sortOrder: 20 },
  { name: "Windsurf", slug: "windsurf", tagline: "Codeium 出品的代理式 IDE", description: "强调「流式」人机协作与深度代码库理解，适合需要跨文件重构与多步骤任务自动化的开发者。可与现有 Git 流程结合，关注大改动前的 diff 审查。", url: "https://windsurf.com", categorySlug: "coding-ide", tags: ["IDE", "Agent"], sortOrder: 30 },
  { name: "Tabnine", slug: "tabnine", tagline: "本地与私有化补全选项", description: "面向企业的代码补全方案，支持本地模型与私有化部署诉求较高的环境。适合金融、政务等对代码外发敏感的组织，在延迟与模型效果之间做权衡。", url: "https://www.tabnine.com", categorySlug: "coding-ide", tags: ["私有化", "补全"], sortOrder: 40 },
  { name: "v0 by Vercel", slug: "v0-vercel", tagline: "从提示词到前端组件", description: "面向 React / Tailwind 等现代前端栈的生成式 UI 工具，可快速产出可复制的组件代码并部署到 Vercel。适合产品原型验证与营销落地页迭代。", url: "https://v0.dev", categorySlug: "low-code", tags: ["前端", "React", "原型"], sortOrder: 10 },
  { name: "Lovable", slug: "lovable", tagline: "对话式生成全栈应用", description: "通过自然语言描述生成可运行的全栈应用骨架，适合独立开发者与小团队做 MVP 验证。上线前仍需关注安全、依赖与数据层设计的完整性。", url: "https://lovable.dev", categorySlug: "low-code", tags: ["全栈", "MVP", "无代码"], sortOrder: 20 },
  { name: "Replit Agent", slug: "replit-agent", tagline: "云端 IDE 中的智能体", description: "在 Replit 云开发环境里自动安装依赖、改代码与运行服务，降低环境配置成本。适合教学、黑客松与轻量后端实验，生产环境需谨慎评估。", url: "https://replit.com", categorySlug: "low-code", tags: ["云IDE", "Agent"], sortOrder: 30 },
  { name: "Midjourney", slug: "midjourney", tagline: "高质量文生图与风格化", description: "以美学与光影见长的文生图社区，适合概念艺术、品牌视觉与社交媒体素材。订阅制与 Discord 工作流是其特色，商业使用请查阅最新许可条款。", url: "https://www.midjourney.com", categorySlug: "image-video", tags: ["文生图", "艺术"], sortOrder: 10 },
  { name: "Runway", slug: "runway", tagline: "视频生成与创意剪辑", description: "提供文生视频、图生视频与一系列 AI 辅助剪辑能力，面向影视、广告与短视频创作者。可与传统后期流程结合，注意生成内容的版权与肖像权合规。", url: "https://runwayml.com", categorySlug: "image-video", tags: ["视频", "创意"], sortOrder: 20 },
  { name: "Stable Diffusion / Stability AI", slug: "stability-ai", tagline: "开源文生图生态", description: "开放权重的图像模型与周边工具链（如 ComfyUI、AUTOMATIC1111）形成庞大社区。适合需要本地部署、微调与批量生成的技术团队，硬件与显存规划是落地关键。", url: "https://stability.ai", categorySlug: "image-video", tags: ["开源", "文生图", "本地"], sortOrder: 30 },
  { name: "Leonardo.Ai", slug: "leonardo-ai", tagline: "游戏与营销素材工作流", description: "面向游戏资产、电商主图与广告素材的生成平台，提供模型微调与批量出图能力。适合中小团队快速迭代视觉物料。", url: "https://leonardo.ai", categorySlug: "image-video", tags: ["文生图", "游戏", "营销"], sortOrder: 40 },
  { name: "ElevenLabs", slug: "elevenlabs", tagline: "语音合成与声音设计", description: "高自然度 TTS、语音克隆与多语言支持，广泛用于播客、视频配音与客服场景。企业需关注声音授权、深度伪造风险与内容审核策略。", url: "https://elevenlabs.io", categorySlug: "audio", tags: ["TTS", "配音"], sortOrder: 10 },
  { name: "Descript", slug: "descript", tagline: "音视频编辑像改文档", description: "以文本驱动剪辑、自动字幕与「Overdub」语音修复著称，适合播客与课程制作者降低后期门槛。", url: "https://www.descript.com", categorySlug: "audio", tags: ["剪辑", "字幕", "播客"], sortOrder: 20 },
  { name: "Perplexity", slug: "perplexity", tagline: "带来源引用的研究型搜索", description: "结合实时检索与摘要的答案引擎，强调引用链接与多轮追问，适合市场调研、学术入门与新闻核查。可作为传统搜索引擎的补充工具。", url: "https://www.perplexity.ai", categorySlug: "search-research", tags: ["搜索", "引用", "研究"], featured: true, sortOrder: 10 },
  { name: "Elicit", slug: "elicit", tagline: "论文与文献工作流", description: "面向科研人员的文献检索与表格抽取工具，可加速系统性综述与元分析的前期筛选。适合高校与研发机构的研究助理场景。", url: "https://elicit.com", categorySlug: "search-research", tags: ["论文", "科研"], sortOrder: 20 },
  { name: "n8n", slug: "n8n", tagline: "可视化工作流自动化", description: "开源自动化平台，可连接数百种 SaaS 与自建服务，支持自托管。与 AI 节点结合后，可实现告警摘要、工单分类与定时报告等场景。", url: "https://n8n.io", categorySlug: "agents", tags: ["自动化", "工作流", "开源"], sortOrder: 10 },
  { name: "Zapier AI", slug: "zapier-ai", tagline: "无代码集成里的 AI 步骤", description: "在现有 Zap 中插入 AI 分类、摘要与生成步骤，适合业务人员快速拼接营销、销售与支持流程。复杂逻辑仍建议配合开发与监控。", url: "https://zapier.com", categorySlug: "agents", tags: ["自动化", "集成"], sortOrder: 20 },
  { name: "Dify", slug: "dify", tagline: "LLM 应用开发与编排平台", description: "开源的 LLM 应用平台，支持知识库、工作流编排、Agent 与多模型切换，适合团队快速搭建内部问答与流程助手并可私有化部署。", url: "https://dify.ai", categorySlug: "agents", tags: ["知识库", "开源", "编排"], featured: true, sortOrder: 30 },
  { name: "Coze / 扣子", slug: "coze", tagline: "可视化搭建聊天机器人与插件", description: "提供插件、工作流与多平台发布能力，适合搭建客服机器人、内部助手与轻量 Agent。可与飞书、微信等渠道对接（以官方支持为准）。", url: "https://www.coze.com", categorySlug: "agents", tags: ["机器人", "插件", "工作流"], sortOrder: 40 },
  { name: "LangSmith", slug: "langsmith", tagline: "LLM 应用可观测与评测", description: "LangChain 生态中的追踪、评测与提示管理平台，适合需要系统化调试提示词、对比模型与分析延迟的团队。", url: "https://smith.langchain.com", categorySlug: "agents", tags: ["可观测", "评测", "LangChain"], sortOrder: 50 },
  { name: "Hugging Face", slug: "huggingface", tagline: "模型、数据集与开源社区", description: "全球最大的开放模型与数据集枢纽之一，提供 Transformers、推理服务与 Spaces 演示。适合研究者、算法工程师与希望快速试验新权重的团队。", url: "https://huggingface.co", categorySlug: "models-infra", tags: ["开源", "模型", "社区"], featured: true, sortOrder: 10 },
  { name: "Ollama", slug: "ollama", tagline: "本地运行开源大模型", description: "在 macOS、Windows 与 Linux 上一键拉取并运行 Llama、Mistral、Gemma 等权重，适合离线演示、隐私敏感场景与开发者本地调试。", url: "https://ollama.com", categorySlug: "models-infra", tags: ["本地", "开源"], sortOrder: 20 },
  { name: "LM Studio", slug: "lm-studio", tagline: "桌面端模型管理与聊天", description: "图形化加载 GGUF 等格式模型，提供聊天界面与本地 API，方便非命令行用户试用不同规模模型。", url: "https://lmstudio.ai", categorySlug: "models-infra", tags: ["本地", "桌面"], sortOrder: 30 },
  { name: "Together AI / Fireworks 类推理云", slug: "together-ai", tagline: "高性能开源模型推理 API", description: "面向开发者的推理与微调云服务，常聚焦开源权重与性价比集群。适合需要弹性扩容与对比多种开源模型的产品团队（具体厂商以官网为准）。", url: "https://www.together.ai", categorySlug: "models-infra", tags: ["API", "推理", "开源"], sortOrder: 40 },
  { name: "Tableau Pulse / Einstein", slug: "tableau-einstein", tagline: "BI 中的自然语言洞察", description: "在传统 BI 工具中嵌入自然语言问答与异常检测，帮助业务用户更快理解指标变化。适合已使用 Salesforce / Tableau 的企业做渐进式智能化。", url: "https://www.tableau.com", categorySlug: "data-analytics", tags: ["BI", "分析", "企业"], sortOrder: 10 },
  { name: "Hex", slug: "hex", tagline: "协作式数据笔记本", description: "结合 SQL、Python 与可视化的协作分析环境，支持将分析逻辑封装为可复用应用。适合数据科学与分析师团队向业务交付自助仪表盘。", url: "https://hex.tech", categorySlug: "data-analytics", tags: ["数据科学", "SQL", "协作"], sortOrder: 20 },
];

for (const t of tools) {
  await prisma.aiTool.upsert({
    where: { slug: t.slug },
    update: { name: t.name, tagline: t.tagline, description: t.description, url: t.url, tags: JSON.stringify(t.tags), featured: t.featured ?? false, sortOrder: t.sortOrder ?? 0, categoryId: t.categorySlug ? bySlug[t.categorySlug] : null },
    create: { name: t.name, slug: t.slug, tagline: t.tagline, description: t.description, url: t.url, tags: JSON.stringify(t.tags), featured: t.featured ?? false, sortOrder: t.sortOrder ?? 0, categoryId: t.categorySlug ? bySlug[t.categorySlug] : null },
  });
}

// 2d. 新闻
const day = 86400000;
const news = [
  { title: "多模态大模型在办公场景落地的五个趋势", slug: "multimodal-office-trends", summary: "从文档理解到实时会议摘要，企业正在把模型嵌入日常协作链路；本文梳理能力、合规与组织配套要点。", content: "趋势一：长上下文让「整本手册进模型」成为可能…（详见源码）", sourceUrl: "https://www.anthropic.com/news", publishedAt: new Date() },
  { title: "AI 编程工具：从补全到代理，开发者该如何选型？", slug: "ai-coding-agents", summary: "IDE 集成、代码库索引与沙箱执行正在重塑工作流；团队可从任务类型、隐私与审查成本三方面评估。", content: "第一阶段：内联补全…（详见源码）", sourceUrl: "https://github.com/features/copilot", publishedAt: new Date(Date.now() - day) },
  { title: "RAG 落地企业知识库：常见坑与工程实践", slug: "rag-enterprise-knowledge", summary: "检索增强生成能缓解「模型不知道内部文档」问题，但切片、召回与引用展示才是成败关键。", content: "为什么需要 RAG…（详见源码）", sourceUrl: "https://python.langchain.com", publishedAt: new Date(Date.now() - 2 * day) },
  { title: "MCP 协议：让 AI 助手安全接入你的工具与数据", slug: "mcp-protocol-explainer", summary: "Model Context Protocol 试图标准化模型与外部系统之间的上下文交换，降低一次性适配成本。", content: "背景：每个聊天应用各自实现「插件」与「工具调用」…（详见源码）", sourceUrl: "https://modelcontextprotocol.io", publishedAt: new Date(Date.now() - 3 * day) },
  { title: "小型团队如何估算大模型 API 账单与性能", slug: "llm-api-cost-basics", summary: "从 Token 计量、缓存到批处理，理解计费维度才能避免月底「惊喜账单」。", content: "Token 是什么…（详见源码）", sourceUrl: "https://openai.com/pricing", publishedAt: new Date(Date.now() - 4 * day) },
  { title: "开源模型 vs 闭源 API：2026 年选型随笔", slug: "open-vs-closed-llms", summary: "没有银弹：看数据敏感度、迭代速度、法务要求与团队 GPU 运维能力。", content: "闭源 API 的优势在于开箱即用…（详见源码）", sourceUrl: "https://huggingface.co", publishedAt: new Date(Date.now() - 5 * day) },
  { title: "视觉生成模型在电商素材中的合规与设计流程", slug: "genai-ecommerce-creative", summary: "主图、详情页与短视频脚本正在引入生成式工作流，但版权与真实性标注不可忽视。", content: "典型流程…（详见源码）", sourceUrl: "https://www.ftc.gov/business-guidance", publishedAt: new Date(Date.now() - 6 * day) },
  { title: "欧盟 AI 法案视角下的高风险系统与企业自查清单（科普）", slug: "eu-ai-act-primer", summary: "监管框架强调透明度、人类监督与基本权利影响评估，出海产品需提前对齐。", content: "欧盟《人工智能法案》按风险等级监管…（详见源码）", sourceUrl: "https://digital-strategy.ec.europa.eu", publishedAt: new Date(Date.now() - 7 * day) },
];
for (const n of news) {
  await prisma.newsArticle.upsert({
    where: { slug: n.slug },
    update: { title: n.title, summary: n.summary, content: n.content, sourceUrl: n.sourceUrl, publishedAt: n.publishedAt },
    create: { title: n.title, slug: n.slug, summary: n.summary, content: n.content, sourceUrl: n.sourceUrl, publishedAt: n.publishedAt },
  });
}

const counts = {
  admin: await prisma.adminUser.count(),
  categories: await prisma.category.count(),
  tools: await prisma.aiTool.count(),
  news: await prisma.newsArticle.count(),
};
console.log(`✅ 种子数据导入完成:`, counts);

await prisma.$disconnect();
