'use client';

import { usePathname } from 'next/navigation';
import { Link } from "@radix-ui/themes";

import { LogoSVG } from "@/components/Logo/Logo";
import { Button } from "@/components/Button/Button";
import { UserNav } from "@/components/UserNav/UserNav";
import Logotype from "@/components/Logotype/Logotype";

import { isTrackerEnabled, isImportEnabled } from "@/lib/featureFlags";

import { useImport } from "@/lib/contexts/ImportContext";
import { useAuth } from '@/lib/contexts/useAuth';

import style from "./HeaderWrapper.module.css";

export function HeaderWrapper() {
  const pathname = usePathname();
  const { processAndImportFile, isUploading } = useImport();
  const { user } = useAuth();

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
        {user && (<>
          {isTrackerEnabled() && (
            <Button href="/pitch-tracker">
              Tracker
            </Button>
          )}

          {isImportEnabled() && (
            <Button
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.csv';
                input.multiple = false; // Explicitly allow only 1 file
                input.onchange = async (event: Event) => {
                  const target = event.target as HTMLInputElement;
                  if (target.files && target.files.length === 1) {
                    const file = target.files[0];
                    await processAndImportFile(file, true); // Private by default
                  }
                };
                input.click();
              }}
              disabled={isUploading}
            >
              {isUploading ? 'Importing...' : 'Import'}
            </Button>
          )}
        </>)}

        <UserNav />
      </div>
    </header>
  );
}