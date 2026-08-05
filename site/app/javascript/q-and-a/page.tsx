import type { Metadata } from "next";
import { JavaScriptNav } from "../../components/TechnologyNav";
import { QuestionAnswerCollection } from "../../components/QuestionAnswerCollection";
import { questionAnswers, questionRoadmap } from "@/generated/content";

export const metadata: Metadata = {
  title: "JavaScript Interview Q&A",
  description: "JavaScript interview questions, answers, explanations, and deeper follow-ups.",
};

export default function JavaScriptQuestionsPage() {
  return (
    <>
      <JavaScriptNav active="q-and-a" />
      <QuestionAnswerCollection
        technology="JavaScript"
        description="A focused companion to the handbook for testing recall and practicing concise interview explanations."
        roadmap={questionRoadmap}
        answers={questionAnswers}
      />
    </>
  );
}
