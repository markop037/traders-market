import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rel =
  process.argv[2] || "app/components/home/HomePageContent.tsx";
const p = path.isAbsolute(rel) ? rel : path.join(__dirname, "..", rel);
let s = fs.readFileSync(p, "utf8");

const pairs = [
  [
    /group relative overflow-hidden rounded-2xl border-2 border-amber-500\/30 bg-gradient-to-br from-amber-950\/30 via-\[#0f172a\]\/90 to-amber-900\/20 transition-all duration-700 hover:border-amber-500\/50 hover:shadow-xl hover:shadow-amber-500\/20 \$\{isVisible \? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'\}/g,
    "group relative overflow-hidden rounded-2xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-950/30 via-[#0f172a]/90 to-amber-900/20 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/20 ${reveal(isVisible, animateEntrance)('opacity-0 translate-y-6', 'opacity-100 translate-y-0')} hover:transition-[opacity,transform,box-shadow] hover:duration-300",
  ],
  [
    /lg:col-span-5 transition-all duration-700 \$\{isVisible \? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'\}/g,
    "lg:col-span-5 ${reveal(isVisible, animateEntrance)('opacity-0 translate-x-4', 'opacity-100 translate-x-0')}",
  ],
  [
    /mx-auto max-w-5xl mb-12 transition-all duration-700 \$\{isVisible \? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'\}/g,
    "mx-auto max-w-5xl mb-12 ${reveal(isVisible, animateEntrance)('opacity-0 translate-y-4', 'opacity-100 translate-y-0')}",
  ],
  [
    /text-center mt-8 transition-all duration-700 \$\{isVisible \? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'\}/g,
    "text-center mt-8 ${reveal(isVisible, animateEntrance)('opacity-0 translate-y-4', 'opacity-100 translate-y-0')}",
  ],
  [
    /text-center transition-all duration-700 \$\{isVisible \? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'\}/g,
    "text-center ${reveal(isVisible, animateEntrance)('opacity-0 translate-y-4', 'opacity-100 translate-y-0')}",
  ],
  [
    /mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-700 \$\{isVisible \? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'\}/g,
    "mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 ${reveal(isVisible, animateEntrance)('opacity-0 translate-y-4', 'opacity-100 translate-y-0')}",
  ],
  [
    /mt-10 flex justify-center transition-all duration-700 \$\{isVisible \? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'\}/g,
    "mt-10 flex justify-center ${reveal(isVisible, animateEntrance)('opacity-0 translate-y-4', 'opacity-100 translate-y-0')}",
  ],
  [
    /mt-6 space-y-3 transition-all duration-700 \$\{isVisible \? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'\}/g,
    "mt-6 space-y-3 ${reveal(isVisible, animateEntrance)('opacity-0 translate-y-4', 'opacity-100 translate-y-0')}",
  ],
  [
    /mt-10 flex flex-col gap-3 sm:flex-row sm:items-center transition-all duration-700 \$\{isVisible \? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'\}/g,
    "mt-10 flex flex-col gap-3 sm:flex-row sm:items-center ${reveal(isVisible, animateEntrance)('opacity-0 translate-y-4', 'opacity-100 translate-y-0')}",
  ],
  [
    /mt-10 flex flex-col gap-4 sm:flex-row sm:items-center transition-all duration-700 \$\{isVisible \? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'\}/g,
    "mt-10 flex flex-col gap-4 sm:flex-row sm:items-center ${reveal(isVisible, animateEntrance)('opacity-0 translate-y-4', 'opacity-100 translate-y-0')}",
  ],
  [
    /transition-all duration-700 \$\{isVisible \? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'\}/g,
    "${reveal(isVisible, animateEntrance)('opacity-0 translate-y-4', 'opacity-100 translate-y-0')}",
  ],
  [
    /transition-all duration-700 \$\{isVisible \? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'\}/g,
    "${reveal(isVisible, animateEntrance)('opacity-0 translate-y-6', 'opacity-100 translate-y-0')}",
  ],
  [
    /transition-all duration-700 \$\{isVisible \? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"\}/g,
    '${reveal(isVisible, animateEntrance)("opacity-0 translate-y-4", "opacity-100 translate-y-0")}',
  ],
  [
    /transition-all duration-700 \$\{isVisible \? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"\}/g,
    '${reveal(isVisible, animateEntrance)("opacity-0 translate-y-6", "opacity-100 translate-y-0")}',
  ],
  [
    /transition-all duration-700 hover:scale-\[1\.02\] \$\{isVisible \? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6"\}/g,
    '${reveal(isVisible, animateEntrance)("opacity-0 -translate-x-6", "opacity-100 translate-x-0")} hover:scale-[1.02] hover:transition-transform hover:duration-300',
  ],
  [
    /transition-all duration-700 hover:scale-\[1\.02\] \$\{isVisible \? "opacity-100 translate-x-0" : "opacity-0 translate-x-6"\}/g,
    '${reveal(isVisible, animateEntrance)("opacity-0 translate-x-6", "opacity-100 translate-x-0")} hover:scale-[1.02] hover:transition-transform hover:duration-300',
  ],
  [
    /transition-all duration-700 \$\{isVisible \? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-6'\}/g,
    "${reveal(isVisible, animateEntrance)('opacity-0 translate-x-6', 'opacity-100 translate-x-0')}",
  ],
  [
    /backdrop-blur-sm transition-all duration-700 \$\{isVisible \? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'\}/g,
    "backdrop-blur-sm ${reveal(isVisible, animateEntrance)('opacity-0 translate-y-6', 'opacity-100 translate-y-0')}",
  ],
  [
    /hover:shadow-blue-800\/25 hover:scale-\[1\.02\] \$\{isVisible \? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'\}/g,
    "hover:shadow-blue-800/25 hover:scale-[1.02] ${reveal(isVisible, animateEntrance)('opacity-0 translate-y-6', 'opacity-100 translate-y-0')} hover:transition-transform hover:duration-300",
  ],
  [
    /lg:col-span-1 \$\{isVisible \? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'\}/g,
    "lg:col-span-1 ${reveal(isVisible, animateEntrance)('opacity-0 translate-y-6', 'opacity-100 translate-y-0')} hover:transition-transform hover:duration-300",
  ],
  [
    /hover:-translate-x-1 \$\{isVisible \? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'\}/g,
    "hover:-translate-x-1 ${reveal(isVisible, animateEntrance)('opacity-0 -translate-x-4', 'opacity-100 translate-x-0')} hover:transition-transform hover:duration-300",
  ],
  [
    /backdrop-blur-sm transition-all duration-700 hover:border-blue-800\/40 hover:bg-gradient-to-br hover:from-blue-950\/30 hover:via-\[#0f1f4a\]\/25 hover:to-blue-900\/30 \$\{isVisible \? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'\}/g,
    "backdrop-blur-sm hover:border-blue-800/40 hover:bg-gradient-to-br hover:from-blue-950/30 hover:via-[#0f1f4a]/25 hover:to-blue-900/30 ${reveal(isVisible, animateEntrance)('opacity-0 translate-y-4', 'opacity-100 translate-y-0')} hover:transition-colors hover:duration-300",
  ],
  [
    /carousel-container-auto transition-all duration-700 \$\{isVisible \? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'\}/g,
    "carousel-container-auto ${reveal(isVisible, animateEntrance)('opacity-0 translate-y-4', 'opacity-100 translate-y-0')}",
  ],
  [
    /sm:p-5 \$\{isVisible \? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"\}/g,
    'sm:p-5 ${reveal(isVisible, animateEntrance)("opacity-0 translate-y-6", "opacity-100 translate-y-0")} hover:transition-transform hover:duration-300',
  ],
];

for (const [rx, rep] of pairs) {
  s = s.replace(rx, rep);
}

// Multiline blocks (Indicators toolkit section)
s = s.replace(
  /\`text-center mb-8 transition-all duration-700 \$\{\s*\n\s*isVisible \? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"\s*\n\s*\}\`/g,
  '`text-center mb-8 ${reveal(isVisible, animateEntrance)("opacity-0 translate-y-4", "opacity-100 translate-y-0")}`'
);
s = s.replace(
  /\`grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3 transition-all duration-700 \$\{\s*\n\s*isVisible \? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"\s*\n\s*\}\`/g,
  '`grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3 ${reveal(isVisible, animateEntrance)("opacity-0 translate-y-6", "opacity-100 translate-y-0")}`'
);
s = s.replace(
  /\`mt-8 flex justify-center transition-all duration-700 \$\{\s*\n\s*isVisible \? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"\s*\n\s*\}\`/g,
  '`mt-8 flex justify-center ${reveal(isVisible, animateEntrance)("opacity-0 translate-y-4", "opacity-100 translate-y-0")}`'
);

// Bot picker mock cards
s = s.replace(
  /transition-all duration-500 \$\{\s*\n\s*idx === 0[\s\S]*?\} \$\{isVisible \? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'\}/g,
  (block) =>
    block.replace(
      /\} \$\{isVisible \? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'\}/,
      "} ${reveal(isVisible, animateEntrance)('opacity-0 translate-y-3', 'opacity-100 translate-y-0')}"
    )
);
// fallback if multiline didn't match
s = s.replace(
  /\} \$\{isVisible \? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'\}/g,
  "} ${reveal(isVisible, animateEntrance)('opacity-0 translate-y-3', 'opacity-100 translate-y-0')}"
);

// transitionDelay (stagger only when entrance is animated)
s = s.replace(
  /transitionDelay: isVisible \?/g,
  "transitionDelay: isVisible && animateEntrance ?"
);

const left = [...s.matchAll(/\$\{isVisible \? ['"]opacity-100/g)];
if (left.length > 0) {
  console.error("Unresolved isVisible ternaries:", left.length);
  for (const m of left.slice(0, 5)) {
    const i = m.index ?? 0;
    console.error(s.slice(Math.max(0, i - 80), i + 120));
  }
  process.exit(1);
}

fs.writeFileSync(p, s);
console.log("Patched", rel);
