import type { Metadata } from "next";
import { AppHeader } from "./components/AppHeader";
import "./globals.css";

const themeInitializationScript = `
  try {
    const savedTheme = localStorage.getItem("handbook-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.dataset.theme = savedTheme ?? (prefersDark ? "dark" : "light");
  } catch {
    document.documentElement.dataset.theme = "light";
  }
`;

const deploymentHost = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
const metadataBase = new URL(
  deploymentHost ? `https://${deploymentHost}` : "http://localhost:3000",
);

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "Frontend Engineering Wiki",
    template: "%s · Frontend Engineering Wiki",
  },
  description: "Handbooks, interview questions, references, and practice for frontend engineers.",
  openGraph: {
    title: "Frontend Engineering Wiki",
    description: "Learn frontend engineering deeply and prepare for senior interviews.",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1731,
        height: 909,
        alt: "Frontend Engineering Wiki",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Frontend Engineering Wiki",
    description: "Learn frontend engineering deeply and prepare for senior interviews.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitializationScript }} />
      </head>
      <body>
        <AppHeader />
        {children}
      </body>
    </html>
  );
}
