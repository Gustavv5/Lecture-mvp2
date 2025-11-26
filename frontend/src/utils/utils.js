export function guessCategory(text) {
  const t = text.toLowerCase();
  if (t.includes("math") || t.includes("algebra") || t.includes("equation")) {
    return "Mathematics";
  }
  if (t.includes("biology") || t.includes("cell") || t.includes("evolution")) {
    return "Science";
  }
  if (t.includes("business") || t.includes("market") || t.includes("economy")) {
    return "Business";
  }
  if (t.includes("history") || t.includes("war") || t.includes("revolution")) {
    return "History";
  }
  if (t.includes("psychology") || t.includes("cognitive")) {
    return "Psychology";
  }
  return "General";
}

export function extractKeyPoints(text, maxPoints = 5) {
  const sentences = text
    .replace(/\s+/g, " ")
    .split(/[.!?]/)
    .map((s) => s.trim())
    .filter(Boolean);

  return sentences.slice(0, maxPoints).map((s) => ({
    point: s,
    importance: "normal",
  }));
}
