"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function AppHeader() {
  const [dark, setDark] = useState(false);
  const pathname = usePathname();
  const isQuestions = pathname.startsWith("/questions");

  useEffect(() => {
    const saved = localStorage.getItem("handbook-theme");
    const shouldUseDark = saved
      ? saved === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(shouldUseDark);
    document.documentElement.dataset.theme = shouldUseDark ? "dark" : "light";
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    localStorage.setItem("handbook-theme", next ? "dark" : "light");
  }

  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="JavaScript Interview Handbook home">
        <span className="brand-mark">JS</span>
        <span className="brand-copy">
          <strong>Interview Handbook</strong>
          <small>Senior frontend edition</small>
        </span>
      </Link>
      <nav className="header-actions" aria-label="Primary navigation">
        <div className="section-switch" aria-label="Choose application section">
          <Link
            className={!isQuestions ? "active" : ""}
            href="/"
            aria-current={!isQuestions ? "page" : undefined}
          >
            Handbook
          </Link>
          <Link
            className={isQuestions ? "active" : ""}
            href="/questions"
            aria-current={isQuestions ? "page" : undefined}
          >
            Q&amp;A
          </Link>
        </div>
        <a
          className="nav-author"
          href="https://github.com/Dmitrii-Lobanov"
          target="_blank"
          rel="noreferrer"
          aria-label="Created by Dmitrii Lobanov — GitHub profile"
        >
          <span className="nav-author-avatar" aria-hidden="true">
            DL
          </span>
          <span className="nav-author-name">
            <small>Handbook author</small>
            <strong>Dmitrii Lobanov</strong>
          </span>
          <span className="nav-author-arrow" aria-hidden="true">
            ↗
          </span>
        </a>
        <a
          href="https://github.com/Dmitrii-Lobanov/javascript-handbook"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
        <button
          className="icon-button"
          onClick={toggleTheme}
          aria-label={`Use ${dark ? "light" : "dark"} theme`}
        >
          {dark ? "☀" : "◐"}
        </button>
      </nav>
    </header>
  );
}
