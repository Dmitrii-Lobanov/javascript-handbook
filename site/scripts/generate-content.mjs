import { existsSync, readdirSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = resolve(siteRoot, "..");
const javascriptRoot = join(repositoryRoot, "javascript");
const bookRoot = join(javascriptRoot, "handbook");
const questionsRoadmapFile = join(javascriptRoot, "q-and-a", "roadmap.md");
const questionsAnswersFile = join(javascriptRoot, "q-and-a", "answers.md");
const outputFile = join(siteRoot, "generated", "content.ts");

if (!existsSync(bookRoot)) {
  if (!existsSync(outputFile)) {
    throw new Error("The handbook source and generated content are both missing.");
  }
  console.log("Using committed generated handbook content.");
  process.exit(0);
}

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function stripMarkdown(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[`*_>#|~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function section(markdown, heading) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = markdown.match(
    new RegExp(`^## ${escaped}\\s*$([\\s\\S]*?)(?=^## |$(?![\\s\\S]))`, "m"),
  );
  return match?.[1]?.trim() ?? "";
}

function introduction(markdown) {
  return markdown.match(/^#\s+.+\n+([\s\S]*?)(?=^##\s)/m)?.[1]?.trim() ?? "";
}

const chapterFiles = walk(bookRoot)
  .filter((path) => /part-\d+[^/]*\/\d+[^/]*\.md$/.test(path))
  .sort((left, right) => {
    const leftNumber = Number(left.match(/\/(\d+)-[^/]+\.md$/)?.[1] ?? 0);
    const rightNumber = Number(right.match(/\/(\d+)-[^/]+\.md$/)?.[1] ?? 0);
    return leftNumber - rightNumber || left.localeCompare(right);
  });

const chapters = chapterFiles.map((path) => {
  const markdown = readFileSync(path, "utf8").trim();
  const parsedNumber = Number(path.match(/\/(\d+)-[^/]+\.md$/)?.[1]);
  const slug = path.match(/\/(\d+-[^/]+)\.md$/)?.[1] ?? String(parsedNumber);
  const summaryMatch = markdown.match(/^#\s+Part\s+([IVX]+)\s+Summary\s+[—-]\s+(.+)$/m);
  const kind = summaryMatch ? "summary" : "chapter";
  const number = summaryMatch ? parsedNumber - 0.5 : parsedNumber;
  const title = summaryMatch
    ? `Part ${summaryMatch[1]} Summary`
    : (markdown.match(/^#\s+Chapter\s+\d+\s+[—-]\s+(.+)$/m)?.[1] ?? slug);
  const partFolder = relative(bookRoot, dirname(path)).split("/")[0];
  const partNumber = Number(partFolder.match(/^part-(\d+)/)?.[1] ?? 1);
  const partName = partFolder.replace(/^part-\d+-/, "").replaceAll("-", " ");
  const headings = [...markdown.matchAll(/^##\s+(.+)$/gm)].map((match) => match[1]);
  const quickRefresher = section(markdown, summaryMatch ? "Core runtime model" : "Quick Refresher");
  const excerptSource = summaryMatch
    ? introduction(markdown)
    : section(markdown, "Why This Matters");
  const excerpt = excerptSource.split(/\n\s*\n/, 1)[0] ?? "";
  const plainText = stripMarkdown(markdown);
  const words = plainText.split(/\s+/).filter(Boolean).length;

  return {
    number,
    slug,
    title,
    kind,
    partNumber,
    partName: partName.replace(/\b\w/g, (letter) => letter.toUpperCase()),
    markdown,
    headings,
    quickRefresher: stripMarkdown(quickRefresher),
    excerpt: stripMarkdown(excerpt),
    readingMinutes: Math.max(1, Math.ceil(words / 220)),
    searchText: plainText.toLowerCase(),
  };
});

const toc = readFileSync(join(bookRoot, "table-of-contents.md"), "utf8");
const roadmap = [];
let currentPart = null;

for (const line of toc.split("\n")) {
  const partMatch = line.match(/^## Part ([IVX]+) — (.+)$/);
  if (partMatch) {
    currentPart = { label: `Part ${partMatch[1]}`, title: partMatch[2], chapters: [] };
    roadmap.push(currentPart);
    continue;
  }

  const chapterMatch = line.match(/^(\d+)\.\s+(.+)$/);
  if (chapterMatch && currentPart) {
    const number = Number(chapterMatch[1]);
    currentPart.chapters.push({
      number,
      title: chapterMatch[2].replaceAll("`", ""),
      slug: chapters.find((chapter) => chapter.number === number)?.slug ?? null,
    });
  }
}

const questionRoadmap = [];
let currentQuestionSection = null;

if (existsSync(questionsRoadmapFile)) {
  const questionRoadmapMarkdown = readFileSync(questionsRoadmapFile, "utf8");

  for (const line of questionRoadmapMarkdown.split("\n")) {
    const sectionMatch = line.match(/^##\s+(.+)$/);
    if (sectionMatch) {
      currentQuestionSection = { title: sectionMatch[1], questions: [] };
      questionRoadmap.push(currentQuestionSection);
      continue;
    }

    const questionMatch = line.match(/^(\d+)\.\s+(.+)$/);
    if (questionMatch && currentQuestionSection) {
      currentQuestionSection.questions.push({
        number: Number(questionMatch[1]),
        title: questionMatch[2].replaceAll("`", ""),
      });
    }
  }
}

function cardField(block, name) {
  const match = block.match(
    new RegExp(
      `^- ${name}\\s*$\\n([\\s\\S]*?)(?=^- (?:question|answer|explanation|details)\\s*$|^---\\s*$|$(?![\\s\\S]))`,
      "m",
    ),
  );

  return (match?.[1] ?? "").replace(/^ {2}/gm, "").trim();
}

function stripInlineMarkdown(markdown) {
  return markdown
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[`*_]/g, "")
    .replace(/\s+([?,.;:])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

const questionAnswers = existsSync(questionsAnswersFile)
  ? readFileSync(questionsAnswersFile, "utf8")
      .split(/(?=^#{2,3} Card \d+\s*$)/m)
      .map((block) => {
        const number = Number(block.match(/^#{2,3} Card (\d+)\s*$/m)?.[1]);
        return {
          number,
          question: stripInlineMarkdown(cardField(block, "question")),
          answer: cardField(block, "answer"),
          explanation: cardField(block, "explanation"),
          details: cardField(block, "details"),
        };
      })
      .filter((card) => card.number && card.question && card.answer)
  : [];

const generated =
  `// Generated by scripts/generate-content.mjs. Do not edit manually.\n\n` +
  `export type Chapter = {\n  number: number;\n  slug: string;\n  title: string;\n  kind: "chapter" | "summary";\n  partNumber: number;\n  partName: string;\n  markdown: string;\n  headings: string[];\n  quickRefresher: string;\n  excerpt: string;\n  readingMinutes: number;\n  searchText: string;\n};\n\n` +
  `export type RoadmapPart = { label: string; title: string; chapters: Array<{ number: number; title: string; slug: string | null }> };\n\n` +
  `export type QuestionRoadmapSection = { title: string; questions: Array<{ number: number; title: string }> };\n\n` +
  `export type QuestionAnswer = { number: number; question: string; answer: string; explanation: string; details: string };\n\n` +
  `export const chapters: Chapter[] = ${JSON.stringify(chapters).replaceAll("<", "\\u003c")};\n\n` +
  `export const roadmap: RoadmapPart[] = ${JSON.stringify(roadmap, null, 2).replaceAll("<", "\\u003c")};\n\n` +
  `export const questionRoadmap: QuestionRoadmapSection[] = ${JSON.stringify(questionRoadmap, null, 2).replaceAll("<", "\\u003c")};\n\n` +
  `export const questionAnswers: QuestionAnswer[] = ${JSON.stringify(questionAnswers, null, 2).replaceAll("<", "\\u003c")};\n`;

mkdirSync(dirname(outputFile), { recursive: true });
writeFileSync(outputFile, generated);
console.log(`Generated ${chapters.length} chapter pages from ${bookRoot}`);
