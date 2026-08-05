"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function AppHeader() {
  const [dark, setDark] = useState(false);
  const pathname = usePathname();
  const isJavaScript = pathname.startsWith("/javascript");

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
      <Link className="brand" href="/" aria-label="Frontend Engineering Wiki home">
        <span className="brand-mark">FE</span>
        <span className="brand-copy">
          <strong>Frontend Wiki</strong>
          <small>Engineering knowledge hub</small>
        </span>
      </Link>
      <nav className="header-actions" aria-label="Primary navigation">
        <div className="section-switch" aria-label="Choose application section">
          <Link
            className={pathname === "/" ? "active" : ""}
            href="/"
            aria-current={pathname === "/" ? "page" : undefined}
          >
            Wiki
          </Link>
          <Link
            className={isJavaScript ? "active" : ""}
            href="/javascript"
            aria-current={isJavaScript ? "page" : undefined}
          >
            JavaScript
          </Link>
        </div>
        <a
          className="nav-author"
          href="https://github.com/Dmitrii-Lobanov"
          target="_blank"
          rel="noreferrer"
          aria-label="Frontend Wiki created by Dmitrii Lobanov — GitHub profile"
        >
          <span className="nav-author-avatar" aria-hidden="true">
            DL
          </span>
          <span className="nav-author-name">
            <small>Wiki author</small>
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
