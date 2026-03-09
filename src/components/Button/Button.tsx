import Link from "next/link";

import { Button as RadixButton } from "@radix-ui/themes";

import style from "./Button.module.css";

export function Button({ children, href, onClick }: { children: React.ReactNode, href?: string, onClick?: () => void }) {
    if (href) {
        return (
            <RadixButton asChild>
                <Link href={href} className={style.button}>
                    {children}
                </Link>
            </RadixButton>
        );
    }

    return (
        <RadixButton onClick={onClick} className={style.button}>
            {children}
        </RadixButton>
    )
}
