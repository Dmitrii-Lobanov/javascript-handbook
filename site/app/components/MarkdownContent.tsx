import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { MermaidDiagram } from "./MermaidDiagram";
import { CopyableCodeBlock } from "./CopyableCodeBlock";

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
        pre: ({ children, ...props }) => {
          const child = Array.isArray(children) ? children[0] : children;
          const isMermaid =
            typeof child === "object" &&
            child !== null &&
            "props" in child &&
            typeof child.props === "object" &&
            child.props !== null &&
            "className" in child.props &&
            String(child.props.className).split(" ").includes("language-mermaid");

          return isMermaid ? (
            <>{children}</>
          ) : (
            <CopyableCodeBlock {...props}>{children}</CopyableCodeBlock>
          );
        },
      }}
    >
      {markdown}
    </ReactMarkdown>
  );
}
