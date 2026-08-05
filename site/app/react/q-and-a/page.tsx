import type { Metadata } from "next";
import { ReactNav } from "../../components/TechnologyNav";
import { QuestionAnswerCollection } from "../../components/QuestionAnswerCollection";
import { reactQuestionAnswers, reactQuestionRoadmap } from "@/generated/content";

export const metadata: Metadata = {
  title: "React Interview Q&A",
  description: "React interview questions, answers, explanations, and deeper follow-ups.",
};

export default function ReactQuestionsPage() {
  return (
    <>
      <ReactNav active="q-and-a" />
      <QuestionAnswerCollection
        technology="React"
        description="Practice concise React explanations, then expand each answer for implementation detail and senior-level follow-ups."
        roadmap={reactQuestionRoadmap}
        answers={reactQuestionAnswers}
      />
    </>
  );
}
