"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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
  if (!name) redirect("/admin/categories?e=1");
  if (!slug) slug = slugify(name);
  if (!slug) redirect("/admin/categories?e=1");
  try {
    await prisma.category.create({ data: { name, slug, sortOrder } });
  } catch {
    redirect("/admin/categories?e=1");
  }
  revalidatePath("/");
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
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
  if (!name || !description || !url) redirect("/admin/tools?e=1");
  if (!slug) slug = slugify(name);
  if (!slug) redirect("/admin/tools?e=1");
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
    redirect("/admin/tools?e=1");
  }
  revalidatePath("/");
  revalidatePath("/admin/tools");
  redirect("/admin/tools");
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
  if (!name || !description || !url) redirect(`/admin/tools?edit=${id}&e=1`);
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
    redirect(`/admin/tools?edit=${id}&e=1`);
  }
  revalidatePath("/");
  revalidatePath("/admin/tools");
  redirect("/admin/tools");
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
  if (!title || !summary || !content) redirect("/admin/news?e=1");
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
    redirect("/admin/news?e=1");
  }
  revalidatePath("/news");
  revalidatePath("/admin/news");
  redirect("/admin/news");
}

export async function updateNews(id: string, formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  let slug = String(formData.get("slug") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const sourceUrl = String(formData.get("sourceUrl") ?? "").trim() || null;
  const published = formData.get("published") === "on";
  if (!title || !summary || !content) redirect(`/admin/news?edit=${id}&e=1`);
  if (!slug) slug = slugify(title);
  try {
    await prisma.newsArticle.update({
      where: { id },
      data: { title, slug, summary, content, sourceUrl, published },
    });
  } catch {
    redirect(`/admin/news?edit=${id}&e=1`);
  }
  revalidatePath("/news");
  revalidatePath("/admin/news");
  redirect("/admin/news");
}

export async function deleteNews(id: string) {
  await prisma.newsArticle.delete({ where: { id } });
  revalidatePath("/news");
  revalidatePath("/admin/news");
}
