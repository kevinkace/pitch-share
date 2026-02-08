import Link from "next/link";

import style from "./Button.module.css";

export function Button({ children, href, onclick }: { children: React.ReactNode, href?: string, onclick?: () => void }) {
    if (href) {
        return (
            <Link href={href} className={style.button}
                >
                {children}
            </Link>
        )
    }

    return (
        <button onClick={onclick} className={style.button}>
            {children}
        </button>
    )
}
