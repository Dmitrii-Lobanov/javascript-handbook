import Link from "next/link";
import { getTrack, type LearningTrack } from "../lib/tracks";

function TrackNav({ track, active }: { track: LearningTrack; active: string }) {
  const items = [
    { slug: "overview", label: "Overview", href: `/${track.slug}` },
    ...track.resources.map((resource) => ({
      slug: resource.slug,
      label: resource.label,
      href: `/${track.slug}/${resource.slug}`,
    })),
  ];

  return (
    <nav className="technology-nav" aria-label={`${track.title} sections`}>
      <Link className="technology-name" href={`/${track.slug}`}>
        <span>{track.mark}</span>
        {track.shortTitle ?? track.title}
      </Link>
      <div>
        {items.map((item) => (
          <Link
            className={active === item.slug ? "active" : ""}
            href={item.href}
            aria-current={active === item.slug ? "page" : undefined}
            key={item.slug}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

type JavaScriptSection = "overview" | "handbook" | "q-and-a" | "practice";

export function JavaScriptNav({ active }: { active: JavaScriptSection }) {
  return <TrackNav track={getTrack("javascript")!} active={active} />;
}

type ReactSection = "overview" | "handbook" | "q-and-a" | "practice";

export function ReactNav({ active }: { active: ReactSection }) {
  return <TrackNav track={getTrack("react")!} active={active} />;
}

export { TrackNav };
