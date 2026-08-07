import Link from "next/link";

const feedbackHref =
  "mailto:dmitriilobanov3@gmail.com?subject=Frontend%20Interview%20Hub%20feedback";

export function AppFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-primary">
        <div className="footer-intro">
          <Link className="brand footer-brand" href="/" aria-label="Frontend Interview Hub home">
            <span className="brand-mark">FE</span>
            <span className="brand-copy">
              <strong>Frontend Interview Hub</strong>
              <small>Learn · Explain · Apply</small>
            </span>
          </Link>
          <p>
            A growing collection of handbooks, interview questions, and practice resources for
            frontend engineers.
          </p>
        </div>

        <nav className="footer-links" aria-label="Footer navigation">
          <div>
            <strong>Explore</strong>
            <Link href="/javascript">JavaScript</Link>
            <Link href="/react">React</Link>
            <Link href="/typescript">TypeScript</Link>
            <Link href="/data-structures-algorithms">DSA</Link>
          </div>
          <div>
            <strong>Resources</strong>
            <Link href="/practice">Practice</Link>
            <Link href="/reference">Reference</Link>
            <Link href="/#tracks-title">All tracks</Link>
          </div>
          <div>
            <strong>Connect</strong>
            <a
              href="https://github.com/Dmitrii-Lobanov"
              target="_blank"
              rel="noreferrer"
            >
              GitHub ↗
            </a>
            <a
              href="https://linkedin.com/in/dmitrii-lobanov"
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn ↗
            </a>
          </div>
        </nav>
      </div>

      <div className="footer-feedback">
        <div>
          <span className="eyebrow">Help improve the hub</span>
          <h2>Found an issue or have a topic suggestion?</h2>
          <p>Your feedback helps keep the explanations useful, accurate, and interview-ready.</p>
        </div>
        <a href={feedbackHref}>Send feedback by email <span aria-hidden="true">→</span></a>
      </div>

      <div className="footer-meta">
        <span>© {new Date().getFullYear()} Dmitrii Lobanov</span>
        <a href="mailto:dmitriilobanov3@gmail.com">dmitriilobanov3@gmail.com</a>
      </div>
    </footer>
  );
}
