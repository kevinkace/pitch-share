import type { Metadata } from "next";
import { Link, Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";

import Analytics from "@/components/Analytics/Analytics";

import "./globals.css";
import style from "./layout.module.css";

export const metadata: Metadata = {
  title: "Pitch Share | Baseball Pitching Analysis",
  description: "Baseball pitching session analysis and tracking tool",
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Analytics />
      </head>

      <Theme appearance="dark" asChild>
        <body className={style.body}>

          <header className={style.header}>
            <Link href="/">
              <div className={style.logoContainer}>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="12" fill="white" stroke="#333" strokeWidth="1.5"/>
                  <path d="M8 12 C12 14, 20 14, 24 12" stroke="#e91e63" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                  <path d="M8 20 C12 18, 20 18, 24 20" stroke="#e91e63" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                  <path d="M2 8 L6 10" stroke="#673ab7" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M2 16 L7 16" stroke="#673ab7" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M2 24 L6 22" stroke="#673ab7" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <h1>Pitch Share</h1>
              </div>
            </Link>
            <p>Baseball pitching session analysis and tracking</p>
          </header>

          <div className={style.main}>
            {children}
          </div>
        </body>
      </Theme>
    </html>
  );
}
