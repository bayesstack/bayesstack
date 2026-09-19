import React from "react";
import "./globals.css";
import { Providers } from "./providers";
import { LearnerShell } from "./components/LearnerShell";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"),
  title: "BayesStack | Learner Experience Studio",
  description: "Interactive course lecture environment, video player, and AI copilot learning assistant.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try { if (localStorage.getItem("bayesstack:learner:sidebar-preference") === "collapsed") document.documentElement.dataset.learnerSidebarPreference = "collapsed"; } catch {}`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          <LearnerShell>{children}</LearnerShell>
        </Providers>
      </body>
    </html>
  );
}
