import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { reactChapters } from "@/generated/content";
import { MarkdownContent } from "../../../../components/MarkdownContent";
import { CompletionControl, TextSizeControls } from "../../../../components/ReaderControls";
import { ReactNav } from "../../../../components/TechnologyNav";

export const dynamicParams = false;

export function generateStaticParams() {
  return reactChapters.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const chapter = reactChapters.find((item) => item.slug === slug);
  return chapter ? { title: chapter.title, description: chapter.excerpt } : {};
}

export default async function ReactChapterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const index = reactChapters.findIndex((item) => item.slug === slug);
  if (index < 0) notFound();

  const chapter = reactChapters[index];
  const previous = reactChapters[index - 1];
  const next = reactChapters[index + 1];

  return (
    <>
      <ReactNav active="handbook" />
      <main className="reader-shell">
        <aside className="chapter-sidebar">
          <Link className="back-link" href="/react/handbook#roadmap">
            ← React roadmap
          </Link>
          <span className="sidebar-label">Part {chapter.partNumber}</span>
          <h2>{chapter.partName}</h2>
          <nav aria-label="Chapter table of contents" tabIndex={0}>
            <span>On this page</span>
            <span className="sr-only">
              Use Tab to move through sections and arrow keys to scroll.
            </span>
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
            <CompletionControl slug={`react-${chapter.slug}`} />
          </div>
          <nav className="chapter-pagination" aria-label="Chapter navigation">
            {previous ? (
              <Link href={`/react/handbook/chapters/${previous.slug}`}>
                <span>Previous</span>
                <strong>← {previous.title}</strong>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={`/react/handbook/chapters/${next.slug}`}>
                <span>Next</span>
                <strong>{next.title} →</strong>
              </Link>
            ) : (
              <Link href="/react/handbook#roadmap">
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
