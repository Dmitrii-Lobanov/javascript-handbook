import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { performanceChapters } from "@/generated/content";
import { MarkdownContent } from "../../../../components/MarkdownContent";
import { CompletionControl, TextSizeControls } from "../../../../components/ReaderControls";
import { TrackNav } from "../../../../components/TechnologyNav";
import { getTrack } from "../../../../lib/tracks";

export const dynamicParams = false;

export function generateStaticParams() {
  return performanceChapters.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const chapter = performanceChapters.find((item) => item.slug === slug);
  return chapter ? { title: chapter.title, description: chapter.excerpt } : {};
}

export default async function PerformanceChapterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const index = performanceChapters.findIndex((item) => item.slug === slug);
  if (index < 0) notFound();

  const chapter = performanceChapters[index];
  const previous = performanceChapters[index - 1];
  const next = performanceChapters[index + 1];

  return (
    <>
      <TrackNav track={getTrack("performance")!} active="handbook" />
      <main className="reader-shell">
        <aside className="chapter-sidebar">
          <Link className="back-link" href="/performance/handbook#roadmap">
            ← Performance roadmap
          </Link>
          <span className="sidebar-label">Part {chapter.partNumber}</span>
          <h2>{chapter.partName}</h2>
          <nav aria-label="Chapter table of contents" tabIndex={0}>
            <span>On this page</span>
            <span className="sr-only">Use Tab to move through sections and arrow keys to scroll.</span>
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
              <span>Chapter {String(chapter.number).padStart(2, "0")}</span>
              <span>{chapter.readingMinutes} min read</span>
            </div>
            <h1>{chapter.title}</h1>
            <p>{chapter.excerpt}</p>
            <TextSizeControls />
          </header>

          <div className="prose">
            <MarkdownContent markdown={chapter.markdown} />
          </div>

          <div className="chapter-completion">
            <p>Finished this chapter?</p>
            <CompletionControl slug={`performance-${chapter.slug}`} />
          </div>

          <nav className="chapter-pagination" aria-label="Chapter navigation">
            {previous ? (
              <Link href={`/performance/handbook/chapters/${previous.slug}`}>
                <span>Previous</span>
                <strong>← {previous.title}</strong>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={`/performance/handbook/chapters/${next.slug}`}>
                <span>Next</span>
                <strong>{next.title} →</strong>
              </Link>
            ) : (
              <Link href="/performance/handbook#roadmap">
                <span>Next</span>
                <strong>Explore the roadmap →</strong>
              </Link>
            )}
          </nav>
        </article>
      </main>
    </>
  );
}
