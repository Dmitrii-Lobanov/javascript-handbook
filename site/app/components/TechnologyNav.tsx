import Link from "next/link";

type JavaScriptSection = "overview" | "handbook" | "q-and-a";

export function JavaScriptNav({ active }: { active: JavaScriptSection }) {
  const items: Array<{ id: JavaScriptSection; label: string; href: string }> = [
    { id: "overview", label: "Overview", href: "/javascript" },
    { id: "handbook", label: "Handbook", href: "/javascript/handbook" },
    { id: "q-and-a", label: "Q&A", href: "/javascript/q-and-a" },
  ];

  return (
    <nav className="technology-nav" aria-label="JavaScript sections">
      <Link className="technology-name" href="/javascript">
        <span>JS</span>
        JavaScript
      </Link>
      <div>
        {items.map((item) => (
          <Link
            className={active === item.id ? "active" : ""}
            href={item.href}
            aria-current={active === item.id ? "page" : undefined}
            key={item.id}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
