import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TrackNav } from "../components/TechnologyNav";
import { getTrack, learningTracks } from "../lib/tracks";

export function generateStaticParams() {
  return learningTracks
    .filter((track) => track.slug !== "javascript" && track.slug !== "react")
    .map((track) => ({ track: track.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ track: string }>;
}): Promise<Metadata> {
  const track = getTrack((await params).track);
  return track
    ? { title: track.title, description: track.description }
    : { title: "Track not found" };
}

export default async function TrackOverview({
  params,
}: {
  params: Promise<{ track: string }>;
}) {
  const track = getTrack((await params).track);
  if (!track || track.slug === "javascript" || track.slug === "react") notFound();

  return (
    <>
      <TrackNav track={track} active="overview" />
      <main className="technology-page">
        <section className="technology-hero">
          <span className="technology-hero-mark planned" aria-hidden="true">
            {track.mark}
          </span>
          <div>
            <span className="eyebrow">Phase {track.phase} · Track roadmap</span>
            <h1>{track.title}</h1>
            <p>{track.description}</p>
            <div className="technology-stats">
              <span><strong>{track.resources.length}</strong> learning modes</span>
              <span>
                <strong>{track.status === "expanding" ? "Expanding" : "Planned"}</strong> content status
              </span>
            </div>
          </div>
        </section>

        <section className="technology-resources" aria-labelledby="track-resources-title">
          <div className="wiki-section-heading">
            <span className="eyebrow">Learning path</span>
            <h2 id="track-resources-title">A complete route through the subject</h2>
            <p>Start with the mental model, rehearse interview explanations, then apply the ideas.</p>
          </div>
          <div className="technology-resource-grid">
            {track.resources.map((resource) => (
              <Link
                className="technology-resource-card available"
                href={`/${track.slug}/${resource.slug}`}
                key={resource.slug}
              >
                <span className="resource-type">{resource.label}</span>
                <h3>{resource.title}</h3>
                <p>{resource.description}</p>
                <div>{resource.available ? "Roadmap available" : "Roadmap ready · Content planned"}</div>
                <span className="resource-link">
                  {resource.available ? "Open roadmap →" : "View roadmap →"}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
