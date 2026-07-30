import type { Metadata } from "next";
import { AppHeader } from "./components/AppHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "JavaScript Interview Handbook",
    template: "%s · JavaScript Interview Handbook",
  },
  description:
    "A rigorous, interview-oriented guide to JavaScript internals for senior frontend engineers.",
  openGraph: {
    title: "JavaScript Interview Handbook",
    description:
      "Master JavaScript internals for senior frontend interviews.",
    type: "website",
    images: [{ url: "/og.png", width: 1731, height: 909, alt: "JavaScript Interview Handbook — Senior Frontend Edition" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "JavaScript Interview Handbook",
    description:
      "Master JavaScript internals for senior frontend interviews.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppHeader />
        {children}
      </body>
    </html>
  );
}
