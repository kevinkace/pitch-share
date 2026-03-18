import Link from "next/link";

import { Button as RadixButton } from "@radix-ui/themes";

import style from "./Button.module.css";

export function Button({ children, href, ...props }: { children: React.ReactNode, href?: string }) {
    if (href) {
        return (
            <RadixButton
                asChild
                {...props}
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
            className={style.button}
            {...props}
        >
            {children}
        </RadixButton>
    );
}
