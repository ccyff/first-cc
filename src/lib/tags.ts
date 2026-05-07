export function parseTagsJson(raw: string): string[] {
  try {
    const v = JSON.parse(raw) as unknown;
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

export function stringifyTags(input: string): string {
  const parts = input
    .split(/[,，]/)
    .map((s) => s.trim())
    .filter(Boolean);
  return JSON.stringify(parts);
}
