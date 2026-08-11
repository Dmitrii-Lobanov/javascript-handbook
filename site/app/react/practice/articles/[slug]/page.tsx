import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { reactPracticeArticles } from "@/generated/content";
import { MarkdownContent } from "../../../../components/MarkdownContent";
import { CompletionControl, TextSizeControls } from "../../../../components/ReaderControls";
import { ReactNav } from "../../../../components/TechnologyNav";

export const dynamicParams = false;

export function generateStaticParams() {
  return reactPracticeArticles.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = reactPracticeArticles.find((item) => item.slug === slug);
  return article ? { title: article.title, description: article.excerpt } : {};
}

export default async function ReactPracticeArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const index = reactPracticeArticles.findIndex((item) => item.slug === slug);
  if (index < 0) notFound();

  const article = reactPracticeArticles[index];
  const previous = reactPracticeArticles[index - 1];
  const next = reactPracticeArticles[index + 1];

  return (
    <>
      <ReactNav active="practice" />
      <main className="reader-shell">
        <aside className="chapter-sidebar">
          <Link className="back-link" href="/react/practice#live-coding-tasks">
            ← Live coding articles
          </Link>
          <span className="sidebar-label">Task {String(article.number).padStart(2, "0")}</span>
          <h2>React Live Coding</h2>
          <nav aria-label="Article table of contents" tabIndex={0}>
            <span>On this page</span>
            <span className="sr-only">Use Tab to move through sections and arrow keys to scroll.</span>
            <ol>
              {article.headings.map((heading) => {
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
              <span>Live coding task {String(article.number).padStart(2, "0")}</span>
              <span>{article.readingMinutes} min read</span>
            </div>
            <h1>{article.title}</h1>
            <p>{article.excerpt}</p>
            <TextSizeControls />
          </header>

          <div className="prose">
            <MarkdownContent markdown={article.markdown} />
          </div>

          <div className="chapter-completion">
            <p>Finished this article?</p>
            <CompletionControl slug={`react-practice-${article.slug}`} />
          </div>

          <nav className="chapter-pagination" aria-label="Article navigation">
            {previous ? (
              <Link href={`/react/practice/articles/${previous.slug}`}>
                <span>Previous</span>
                <strong>← {previous.title}</strong>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={`/react/practice/articles/${next.slug}`}>
                <span>Next</span>
                <strong>{next.title} →</strong>
              </Link>
            ) : (
              <Link href="/react/practice#live-coding-tasks">
                <span>Next</span>
                <strong>Explore all tasks →</strong>
              </Link>
            )}
          </nav>
        </article>
      </main>
    </>
  );
}
