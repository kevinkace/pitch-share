import type { Metadata } from "next";
import { Theme } from "@radix-ui/themes";
import { Bungee, Jost } from "next/font/google";
import "@radix-ui/themes/styles.css";

import { AuthProvider } from "@/lib/contexts/AuthContext";
import { ProfileProvider } from "@/lib/contexts/ProfileContext";
import { ImportProvider } from "@/lib/contexts/ImportContext";

import Analytics from "@/components/Analytics/Analytics";
import { HeaderWrapper } from "@/components/HeaderWrapper/HeaderWrapper";
import Footer from "@/components/Footer/Footer";

import "./globals.css";
import style from "./layout.module.css";

const bungee = Bungee({
    weight: "400",
    subsets: ["latin"],
    display: "swap",
    variable: "--font-bungee",
});

const jost = Jost({
    weight: ["400", "500", "600", "700"],
    subsets: ["latin"],
    display: "swap",
    variable: "--font-jost",
});

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
                <body className={`${style.body} ${bungee.variable} ${jost.variable}`}>
                    <AuthProvider>
                        <ProfileProvider>
                            <ImportProvider>
                                <HeaderWrapper />
                                {children}
                                <Footer />
                            </ImportProvider>
                        </ProfileProvider>
                    </AuthProvider>
                </body>
            </Theme>
        </html>
    );
}
