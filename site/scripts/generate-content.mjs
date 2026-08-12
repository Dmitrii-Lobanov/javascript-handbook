import { existsSync, readdirSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = resolve(siteRoot, "..");
const javascriptRoot = join(repositoryRoot, "javascript");
const reactRoot = join(repositoryRoot, "react");
const performanceRoot = join(repositoryRoot, "performance");
const bookRoot = join(javascriptRoot, "handbook");
const performanceBookRoot = join(performanceRoot, "handbook");
const reactBookRoot = join(reactRoot, "handbook");
const reactPracticeRoot = join(reactRoot, "practice", "articles");
const questionsRoadmapFile = join(javascriptRoot, "q-and-a", "roadmap.md");
const questionsAnswersFile = join(javascriptRoot, "q-and-a", "answers.md");
const reactQuestionsAnswersFile = join(reactRoot, "q-and-a", "answers.md");
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

const performanceParts = [
  { from: 1, number: 1, name: "Performance Reasoning" },
  { from: 4, number: 2, name: "Loading Performance" },
  { from: 9, number: 3, name: "Runtime Performance" },
  { from: 13, number: 4, name: "Application Architecture" },
  { from: 17, number: 5, name: "Stability and Memory" },
  { from: 19, number: 6, name: "Performance as Engineering Practice" },
];

const performanceChapters = existsSync(performanceBookRoot)
  ? walk(performanceBookRoot)
      .filter((path) => /\/\d+[^/]*\.md$/.test(path))
      .sort((left, right) => left.localeCompare(right))
      .map((path) => {
        const markdown = readFileSync(path, "utf8").trim();
        const number = Number(path.match(/\/(\d+)-[^/]+\.md$/)?.[1]);
        const slug = path.match(/\/(\d+-[^/]+)\.md$/)?.[1] ?? String(number);
        const title = markdown.match(/^#\s+Chapter\s+\d+\s+[—-]\s+(.+)$/m)?.[1] ?? slug;
        const headings = [...markdown.matchAll(/^##\s+(.+)$/gm)].map((match) => match[1]);
        const excerptSource = section(markdown, "Why this matters");
        const excerpt = excerptSource.split(/\n\s*\n/, 1)[0] ?? "";
        const plainText = stripMarkdown(markdown);
        const words = plainText.split(/\s+/).filter(Boolean).length;
        const part =
          performanceParts.findLast((item) => number >= item.from) ?? performanceParts[0];

        return {
          number,
          slug,
          title,
          kind: "chapter",
          partNumber: part.number,
          partName: part.name,
          markdown,
          headings,
          quickRefresher: stripMarkdown(section(markdown, "Quick refresher")),
          excerpt: stripMarkdown(excerpt),
          readingMinutes: Math.max(1, Math.ceil(words / 220)),
          searchText: plainText.toLowerCase(),
        };
      })
  : [];

const reactParts = [
  { from: 1, number: 1, name: "Rendering Model" },
  { from: 8, number: 2, name: "State and Hooks" },
  { from: 17, number: 3, name: "Component Design" },
  { from: 25, number: 4, name: "Performance" },
  { from: 33, number: 5, name: "Modern React Architecture" },
  { from: 41, number: 6, name: "Testing and Production Behavior" },
];

const reactChapters = existsSync(reactBookRoot)
  ? walk(reactBookRoot)
      .filter((path) => /\/\d+[^/]*\.md$/.test(path))
      .sort((left, right) => left.localeCompare(right))
      .map((path) => {
        const markdown = readFileSync(path, "utf8").trim();
        const number = Number(path.match(/\/(\d+)-[^/]+\.md$/)?.[1]);
        const slug = path.match(/\/(\d+-[^/]+)\.md$/)?.[1] ?? String(number);
        const title = markdown.match(/^#\s+Chapter\s+\d+\s+[—-]\s+(.+)$/m)?.[1] ?? slug;
        const headings = [...markdown.matchAll(/^##\s+(.+)$/gm)].map((match) => match[1]);
        const excerpt = section(markdown, "Why this matters").split(/\n\s*\n/, 1)[0] ?? "";
        const plainText = stripMarkdown(markdown);
        const part = reactParts.findLast((item) => number >= item.from) ?? reactParts[0];

        return {
          number,
          slug,
          title,
          kind: "chapter",
          partNumber: part.number,
          partName: part.name,
          markdown,
          headings,
          quickRefresher: stripMarkdown(section(markdown, "Quick refresher")),
          excerpt: stripMarkdown(excerpt),
          readingMinutes: Math.max(
            1,
            Math.ceil(plainText.split(/\s+/).filter(Boolean).length / 220),
          ),
          searchText: plainText.toLowerCase(),
        };
      })
  : [];

const reactPracticeArticles = existsSync(reactPracticeRoot)
  ? walk(reactPracticeRoot)
      .filter((path) => /\/\d+[^/]*\.md$/.test(path))
      .sort((left, right) => left.localeCompare(right))
      .map((path) => {
        const markdown = readFileSync(path, "utf8").trim();
        const number = Number(path.match(/\/(\d+)-[^/]+\.md$/)?.[1]);
        const slug = path.match(/\/(\d+-[^/]+)\.md$/)?.[1] ?? String(number);
        const title = markdown.match(/^#\s+(.+)$/m)?.[1] ?? slug;
        const headings = [...markdown.matchAll(/^##\s+(.+)$/gm)].map((match) => match[1]);
        const excerptSource = section(markdown, "The interview prompt");
        const excerpt = excerptSource.split(/\n\s*\n/, 1)[0] ?? "";
        const plainText = stripMarkdown(markdown);
        const words = plainText.split(/\s+/).filter(Boolean).length;

        return {
          number,
          slug,
          title,
          kind: "chapter",
          partNumber: 1,
          partName: "React Live Coding",
          markdown,
          headings,
          quickRefresher: "",
          excerpt: stripMarkdown(excerpt),
          readingMinutes: Math.max(1, Math.ceil(words / 220)),
          searchText: plainText.toLowerCase(),
        };
      })
  : [];

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

function parseQuestionAnswers(file) {
  if (!existsSync(file)) return [];

  return readFileSync(file, "utf8")
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
    .filter((card) => card.number && card.question && card.answer);
}

function roadmapFromAnswerFile(file, answers) {
  if (!existsSync(file)) return [];

  const sections = [];
  let currentSection = null;
  const answersByNumber = new Map(answers.map((answer) => [answer.number, answer]));

  for (const line of readFileSync(file, "utf8").split("\n")) {
    const cardMatch = line.match(/^#{2,3} Card (\d+)\s*$/);
    if (cardMatch && currentSection) {
      const answer = answersByNumber.get(Number(cardMatch[1]));
      if (answer) {
        currentSection.questions.push({ number: answer.number, title: answer.question });
      }
      continue;
    }

    const sectionMatch = line.match(/^#{1,2} (?!Card\s)(.+)$/);
    if (sectionMatch) {
      currentSection = { title: sectionMatch[1], questions: [] };
      sections.push(currentSection);
    }
  }

  return sections.filter((section) => section.questions.length > 0);
}

const questionAnswers = parseQuestionAnswers(questionsAnswersFile);
const reactQuestionAnswers = parseQuestionAnswers(reactQuestionsAnswersFile);
const reactQuestionRoadmap = roadmapFromAnswerFile(reactQuestionsAnswersFile, reactQuestionAnswers);

const generated =
  `// Generated by scripts/generate-content.mjs. Do not edit manually.\n\n` +
  `export type Chapter = {\n  number: number;\n  slug: string;\n  title: string;\n  kind: "chapter" | "summary";\n  partNumber: number;\n  partName: string;\n  markdown: string;\n  headings: string[];\n  quickRefresher: string;\n  excerpt: string;\n  readingMinutes: number;\n  searchText: string;\n};\n\n` +
  `export type RoadmapPart = { label: string; title: string; chapters: Array<{ number: number; title: string; slug: string | null }> };\n\n` +
  `export type QuestionRoadmapSection = { title: string; questions: Array<{ number: number; title: string }> };\n\n` +
  `export type QuestionAnswer = { number: number; question: string; answer: string; explanation: string; details: string };\n\n` +
  `export const chapters: Chapter[] = ${JSON.stringify(chapters).replaceAll("<", "\\u003c")};\n\n` +
  `export const performanceChapters: Chapter[] = ${JSON.stringify(performanceChapters).replaceAll("<", "\\u003c")};\n\n` +
  `export const reactChapters: Chapter[] = ${JSON.stringify(reactChapters).replaceAll("<", "\\u003c")};\n\n` +
  `export const reactPracticeArticles: Chapter[] = ${JSON.stringify(reactPracticeArticles).replaceAll("<", "\\u003c")};\n\n` +
  `export const roadmap: RoadmapPart[] = ${JSON.stringify(roadmap, null, 2).replaceAll("<", "\\u003c")};\n\n` +
  `export const questionRoadmap: QuestionRoadmapSection[] = ${JSON.stringify(questionRoadmap, null, 2).replaceAll("<", "\\u003c")};\n\n` +
  `export const questionAnswers: QuestionAnswer[] = ${JSON.stringify(questionAnswers, null, 2).replaceAll("<", "\\u003c")};\n\n` +
  `export const reactQuestionRoadmap: QuestionRoadmapSection[] = ${JSON.stringify(reactQuestionRoadmap, null, 2).replaceAll("<", "\\u003c")};\n\n` +
  `export const reactQuestionAnswers: QuestionAnswer[] = ${JSON.stringify(reactQuestionAnswers, null, 2).replaceAll("<", "\\u003c")};\n`;

mkdirSync(dirname(outputFile), { recursive: true });
writeFileSync(outputFile, generated);
console.log(`Generated ${chapters.length} chapter pages from ${bookRoot}`);
