import type { Metadata } from "next";
import { Library } from "./components/Library";
import { chapters, roadmap } from "@/generated/content";

export const metadata: Metadata = {
  title: "JavaScript Interview Handbook",
};

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="hero-kicker">Senior frontend interview preparation</div>
        <h1>
          Understand JavaScript deeply.
          <br />
          Explain it clearly.
        </h1>
        <p className="hero-copy">
          A rigorous handbook connecting ECMAScript internals, browser behavior, performance,
          debugging, and React—not a collection of trivia.
        </p>
        <div className="hero-stats" aria-label="Handbook statistics">
          <div>
            <strong>{chapters.length}</strong>
            <span>chapters available</span>
          </div>
          <div>
            <strong>76</strong>
            <span>chapters planned</span>
          </div>
          <div>
            <strong>4</strong>
            <span>interview levels</span>
          </div>
        </div>
      </section>

      <Library chapters={chapters} roadmap={roadmap} />
    </main>
  );
}
