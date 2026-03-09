'use client';

import { usePathname } from 'next/navigation';
import { Link } from "@radix-ui/themes";

import { LogoSVG } from "@/components/Logo/Logo";
import { Button } from "@/components/Button/Button";
import { UserNav } from "@/components/UserNav/UserNav";
import Logotype from "@/components/Logotype/Logotype";

import { isTrackerEnabled, isImportEnabled } from "@/lib/featureFlags";

import style from "./HeaderWrapper.module.css";

export function HeaderWrapper() {
  const pathname = usePathname();

  // Hide header on login page
  if (pathname === '/login') {
    return null;
  }

  return (
    <header className={style.header}>
      <div>
        <Link href="/">
          <div className={style.logoContainer}>
            <LogoSVG width={32} height={32} />
            <h1><Logotype /></h1>
          </div>
        </Link>
        <p>Baseball pitching session analysis and tracking</p>
      </div>

      <div className={style.headerActions}>
        {isTrackerEnabled() && (
          <Button href="/pitch-tracker">
            Tracker
          </Button>
        )}

        {isImportEnabled() && (
          <Button href="/import">
            Import
          </Button>
        )}

        <UserNav />
      </div>
    </header>
  );
}