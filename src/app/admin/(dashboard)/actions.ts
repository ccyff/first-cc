"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { stringifyTags } from "@/lib/tags";

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fff]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function createCategory(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  let slug = String(formData.get("slug") ?? "").trim();
  const sortOrder = Number(formData.get("sortOrder") ?? 0) || 0;
  if (!name) return { error: "名称必填" };
  if (!slug) slug = slugify(name);
  if (!slug) return { error: "请填写有效 slug" };
  try {
    await prisma.category.create({ data: { name, slug, sortOrder } });
  } catch {
    return { error: "分类创建失败（slug 可能重复）" };
  }
  revalidatePath("/");
  revalidatePath("/admin/categories");
  return { ok: true };
}

export async function deleteCategory(id: string) {
  await prisma.category.delete({ where: { id } }).catch(() => null);
  revalidatePath("/");
  revalidatePath("/admin/categories");
}

export async function createTool(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  let slug = String(formData.get("slug") ?? "").trim();
  const tagline = String(formData.get("tagline") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "").trim() || null;
  const tagsRaw = String(formData.get("tags") ?? "");
  const featured = formData.get("featured") === "on";
  const sortOrder = Number(formData.get("sortOrder") ?? 0) || 0;
  if (!name || !description || !url) return { error: "名称、描述、链接必填" };
  if (!slug) slug = slugify(name);
  if (!slug) return { error: "请填写有效 slug" };
  try {
    await prisma.aiTool.create({
      data: {
        name,
        slug,
        tagline,
        description,
        url,
        tags: stringifyTags(tagsRaw),
        featured,
        sortOrder,
        categoryId: categoryId || null,
      },
    });
  } catch {
    return { error: "创建失败（slug 可能重复）" };
  }
  revalidatePath("/");
  revalidatePath("/admin/tools");
  return { ok: true };
}

export async function updateTool(id: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  let slug = String(formData.get("slug") ?? "").trim();
  const tagline = String(formData.get("tagline") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "").trim() || null;
  const tagsRaw = String(formData.get("tags") ?? "");
  const featured = formData.get("featured") === "on";
  const sortOrder = Number(formData.get("sortOrder") ?? 0) || 0;
  if (!name || !description || !url) return { error: "名称、描述、链接必填" };
  if (!slug) slug = slugify(name);
  try {
    await prisma.aiTool.update({
      where: { id },
      data: {
        name,
        slug,
        tagline,
        description,
        url,
        tags: stringifyTags(tagsRaw),
        featured,
        sortOrder,
        categoryId: categoryId || null,
      },
    });
  } catch {
    return { error: "更新失败" };
  }
  revalidatePath("/");
  revalidatePath("/admin/tools");
  return { ok: true };
}

export async function deleteTool(id: string) {
  await prisma.aiTool.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/tools");
}

export async function createNews(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  let slug = String(formData.get("slug") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const sourceUrl = String(formData.get("sourceUrl") ?? "").trim() || null;
  const published = formData.get("published") === "on";
  if (!title || !summary || !content) return { error: "标题、摘要、正文必填" };
  if (!slug) slug = slugify(title);
  try {
    await prisma.newsArticle.create({
      data: {
        title,
        slug,
        summary,
        content,
        sourceUrl,
        published,
      },
    });
  } catch {
    return { error: "创建失败（slug 可能重复）" };
  }
  revalidatePath("/news");
  revalidatePath("/admin/news");
  return { ok: true };
}

export async function updateNews(id: string, formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  let slug = String(formData.get("slug") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const sourceUrl = String(formData.get("sourceUrl") ?? "").trim() || null;
  const published = formData.get("published") === "on";
  if (!title || !summary || !content) return { error: "标题、摘要、正文必填" };
  if (!slug) slug = slugify(title);
  try {
    await prisma.newsArticle.update({
      where: { id },
      data: { title, slug, summary, content, sourceUrl, published },
    });
  } catch {
    return { error: "更新失败" };
  }
  revalidatePath("/news");
  revalidatePath("/admin/news");
  return { ok: true };
}

export async function deleteNews(id: string) {
  await prisma.newsArticle.delete({ where: { id } });
  revalidatePath("/news");
  revalidatePath("/admin/news");
}
