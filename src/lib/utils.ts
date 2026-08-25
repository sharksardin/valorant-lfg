export const getTierColor = (tier: string) => {
  if (!tier) return "text-gray-500";
  const t = tier.toLowerCase();
  if (t.includes("iron")) return "text-gray-400";
  if (t.includes("bronze")) return "text-[#cd7f32]";
  if (t.includes("silver")) return "text-gray-300";
  if (t.includes("gold")) return "text-yellow-400";
  if (t.includes("platinum")) return "text-[#49c6b8]";
  if (t.includes("diamond")) return "text-[#b489fa]";
  if (t.includes("ascendant")) return "text-[#2e8b57]";
  if (t.includes("immortal")) return "text-[#ff4655]";
  if (t.includes("radiant")) return "text-[#ffffcc] drop-shadow-[0_0_5px_rgba(255,255,204,0.5)]";
  return "text-[var(--valo-red)]";
};
