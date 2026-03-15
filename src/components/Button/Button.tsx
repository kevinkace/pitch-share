import Link from "next/link";

import { Button as RadixButton } from "@radix-ui/themes";

import style from "./Button.module.css";

export function Button({ children, href, onClick, variant }: { children: React.ReactNode, href?: string, onClick?: () => void, variant?: "soft" | "solid" }) {
    if (href) {
        return (
            <RadixButton
                asChild
                variant={variant}
            >
                <Link
                    href={href}
                    className={style.button}
                >
                    {children}
                </Link>
            </RadixButton>
        );
    }

    return (
        <RadixButton
            onClick={onClick}
            className={style.button}
            variant={variant}
        >
            {children}
        </RadixButton>
    );
}
