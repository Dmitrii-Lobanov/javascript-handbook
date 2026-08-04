import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { chapters } from "@/generated/content";
import { MarkdownContent } from "../../components/MarkdownContent";
import { CompletionControl, TextSizeControls } from "../../components/ReaderControls";

export const dynamicParams = false;

export function generateStaticParams() {
  return chapters.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const chapter = chapters.find((item) => item.slug === slug);
  if (!chapter) return {};
  return { title: chapter.title, description: chapter.excerpt };
}

export default async function ChapterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const index = chapters.findIndex((item) => item.slug === slug);
  if (index < 0) notFound();
  const chapter = chapters[index];
  const previous = chapters[index - 1];
  const next = chapters[index + 1];

  return (
    <main className="reader-shell">
      <aside className="chapter-sidebar">
        <Link className="back-link" href="/#library">
          ← All chapters
        </Link>
        <span className="sidebar-label"> Part {chapter.partNumber}</span>
        <h2>{chapter.partName}</h2>
        <nav aria-label="Chapter table of contents">
          <span>On this page</span>
          <ol>
            {chapter.headings.map((heading) => {
              const id = heading
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");
              return (
                <li key={id}>
                  <a href={`#${id}`}>{heading}</a>
                </li>
              );
            })}
          </ol>
        </nav>
      </aside>

      <article className="chapter-reader">
        <header className="chapter-hero">
          <div className="chapter-meta">
            <span>
              {chapter.kind === "summary"
                ? `Part ${chapter.partNumber} Summary`
                : `Chapter ${String(chapter.number).padStart(2, "0")}`}
            </span>
            <span>{chapter.readingMinutes} min read</span>
          </div>
          <h1>{chapter.title}</h1>
          <p>{chapter.excerpt}</p>
          <TextSizeControls />
        </header>

        <div className="prose">
          <MarkdownContent markdown={chapter.markdown} />
        </div>

        {chapter.kind === "chapter" && (
          <div className="chapter-completion">
            <p>Finished this chapter?</p>
            <CompletionControl slug={chapter.slug} />
          </div>
        )}

        <nav className="chapter-pagination" aria-label="Chapter navigation">
          {previous ? (
            <Link href={`/chapters/${previous.slug}`}>
              <span>Previous</span>
              <strong>← {previous.title}</strong>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/chapters/${next.slug}`}>
              <span>Next</span>
              <strong>{next.title} →</strong>
            </Link>
          ) : (
            <Link href="/#library">
              <span>Next</span>
              <strong>Explore the roadmap →</strong>
            </Link>
          )}
        </nav>
      </article>
    </main>
  );
}
