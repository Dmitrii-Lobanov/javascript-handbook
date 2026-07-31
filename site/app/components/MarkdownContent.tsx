import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { MermaidDiagram } from "./MermaidDiagram";

export function MarkdownContent({ markdown }: { markdown: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, rehypeSlug, [rehypeHighlight, { plainText: ["mermaid"] }]]}
      components={{
        a: ({ href = "", children, ...props }) => (
          <a
            href={href}
            {...props}
            {...(href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
          >
            {children}
          </a>
        ),
        code: ({ className, children, ...props }) => {
          if (className?.split(" ").includes("language-mermaid")) {
            return <MermaidDiagram chart={String(children).trim()} />;
          }
          return (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
      }}
    >
      {markdown}
    </ReactMarkdown>
  );
}
