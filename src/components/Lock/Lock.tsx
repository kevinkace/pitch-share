"use client";

import { LockClosedIcon, LockOpen1Icon } from "@radix-ui/react-icons";

export default function Lock({ isLocked }: { isLocked: boolean }) {
    return isLocked ? <LockClosedIcon /> : <LockOpen1Icon />;
}
