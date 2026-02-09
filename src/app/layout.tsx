import type { Metadata } from "next";
import { Link, Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";

import { LogoSVG } from "@/components/Logo/Logo";
import Analytics from "@/components/Analytics/Analytics";

import "./globals.css";
import style from "./layout.module.css";
import { Button } from "@/components/Button/Button";

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
                        <div>
                            <Link href="/">
                                <div className={style.logoContainer}>
                                    <LogoSVG width={32} height={32} />
                                    <h1>Pitch Share</h1>
                                </div>
                            </Link>
                            <p>Baseball pitching session analysis and tracking</p>
                        </div>

                        <Button href="/pitch-tracker">
                            Pitch Tracker
                        </Button>
                    </header>

                    {children}

                </body>
            </Theme>
        </html>
    );
}
