"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { learningTracks } from "../lib/tracks";

export function AppHeader() {
  const [dark, setDark] = useState(false);
  const tracksMenuRef = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();
  const activeTrack = learningTracks.find((track) => pathname.startsWith(`/${track.slug}`));

  useEffect(() => {
    const saved = localStorage.getItem("handbook-theme");
    const shouldUseDark = saved
      ? saved === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(shouldUseDark);
    document.documentElement.dataset.theme = shouldUseDark ? "dark" : "light";
  }, []);

  useEffect(() => {
    function closeTracksMenu(event: PointerEvent) {
      const menu = tracksMenuRef.current;
      if (menu?.open && event.target instanceof Node && !menu.contains(event.target)) {
        menu.open = false;
      }
    }

    function closeTracksMenuWithKeyboard(event: KeyboardEvent) {
      const menu = tracksMenuRef.current;
      if (event.key === "Escape" && menu?.open) {
        menu.open = false;
        menu.querySelector("summary")?.focus();
      }
    }

    document.addEventListener("pointerdown", closeTracksMenu);
    document.addEventListener("keydown", closeTracksMenuWithKeyboard);

    return () => {
      document.removeEventListener("pointerdown", closeTracksMenu);
      document.removeEventListener("keydown", closeTracksMenuWithKeyboard);
    };
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
        <Link
          className={`header-link ${pathname === "/" ? "active" : ""}`}
          href="/"
          aria-current={pathname === "/" ? "page" : undefined}
        >
          Home
        </Link>
        <details ref={tracksMenuRef} className={`tracks-menu ${activeTrack ? "active" : ""}`}>
          <summary>
            {activeTrack?.shortTitle ?? activeTrack?.title ?? "Tracks"}
            <span className="tracks-menu-chevron" aria-hidden="true" />
          </summary>
          <div className="tracks-menu-panel">
            <div className="tracks-menu-heading">
              <div>
                <strong>Learning tracks</strong>
                <small>Handbook · Q&amp;A · Practice</small>
              </div>
              <Link href="/#tracks-title">View all</Link>
            </div>
            <div className="tracks-menu-grid">
              {learningTracks.map((track) => (
                <Link
                  className={activeTrack?.slug === track.slug ? "active" : ""}
                  href={`/${track.slug}`}
                  key={track.slug}
                >
                  <span>{track.mark}</span>
                  <span>
                    <strong>{track.shortTitle ?? track.title}</strong>
                    <small>
                      {track.status === "available"
                        ? "Available"
                        : track.status === "expanding"
                          ? "Expanding"
                          : `Phase ${track.phase}`}
                    </small>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </details>
        <Link
          className={`header-link ${pathname.startsWith("/practice") ? "active" : ""}`}
          href="/practice"
        >
          Practice
        </Link>
        <Link
          className={`header-link ${pathname.startsWith("/reference") ? "active" : ""}`}
          href="/reference"
        >
          Reference
        </Link>
        <a
          className="header-feedback"
          href="mailto:dmitriilobanov3@gmail.com?subject=Frontend%20Interview%20Hub%20feedback"
        >
          Send feedback
        </a>
        <a
          className="header-github"
          href="https://github.com/Dmitrii-Lobanov/javascript-handbook"
          target="_blank"
          rel="noreferrer"
          aria-label="Frontend Interview Hub on GitHub"
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
