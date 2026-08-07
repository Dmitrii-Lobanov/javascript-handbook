import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TrackNav } from "../../components/TechnologyNav";
import { getTrack, learningTracks } from "../../lib/tracks";

export function generateStaticParams() {
  return learningTracks.flatMap((track) =>
    track.resources
      .filter((resource) => !resource.available)
      .map((resource) => ({ track: track.slug, resource: resource.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ track: string; resource: string }>;
}): Promise<Metadata> {
  const values = await params;
  const resource = getTrack(values.track)?.resources.find((item) => item.slug === values.resource);
  return resource
    ? { title: resource.title, description: resource.description }
    : { title: "Resource not found" };
}

export default async function PlannedResource({
  params,
}: {
  params: Promise<{ track: string; resource: string }>;
}) {
  const values = await params;
  const track = getTrack(values.track);
  const resource = track?.resources.find((item) => item.slug === values.resource);
  if (!track || !resource || resource.available) notFound();

  return (
    <>
      <TrackNav track={track} active={resource.slug} />
      <main className="collection-page">
        <section className="collection-hero planned-resource-hero">
          <span className="eyebrow">{track.title} · {resource.label}</span>
          <h1>{resource.title}</h1>
          <p>{resource.description}</p>
          <span className="coming-soon-pill">Phase {track.phase} · Content planned</span>
        </section>
        <section className="collection-content">
          <div className="wiki-section-heading">
            <span className="eyebrow">Part of the learning path</span>
            <h2>Understand, explain, then apply.</h2>
            <p>
              This route is reserved in the Frontend Interview Hub and will grow without changing
              its URL.
            </p>
          </div>
          <Link className="back-to-wiki" href={`/${track.slug}`}>
            ← Back to {track.title}
          </Link>
        </section>
      </main>
    </>
  );
}
