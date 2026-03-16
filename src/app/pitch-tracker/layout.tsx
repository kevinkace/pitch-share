import type { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Pitch Tracker | Pitch Share',
};

export default function PitchTrackerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}