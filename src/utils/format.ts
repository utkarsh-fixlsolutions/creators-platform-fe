/**
 * 892 → "892", 3241 → "3,241", 84_300 → "84.3k", 1_200_000 → "1.2M"
 * Exact numbers under 10k so a single like/comment visibly changes the count.
 */
export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${trim((n / 1_000_000).toFixed(1))}M`;
  if (n >= 10_000) return `${trim((n / 1_000).toFixed(1))}k`;
  return n.toLocaleString("en-US");
}

const trim = (s: string) => s.replace(/\.0$/, "");

export function greeting(date = new Date()): string {
  const h = date.getHours();
  if (h < 5) return "Up late";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
