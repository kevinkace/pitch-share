'use client';

import { usePathname } from 'next/navigation';
import { Link, Flex } from "@radix-ui/themes";

import { LogoSVG } from "@/components/Logo/Logo";
import { Button } from "@/components/Button/Button";
import { UserNav } from "@/components/UserNav/UserNav";
import Logotype from "@/components/Logotype/Logotype";

import { isTrackerEnabled, isImportEnabled } from "@/lib/featureFlags";

import { useImportWithUsernameCheck } from "@/lib/hooks/useImportWithUsernameCheck";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useUserProfile } from "@/lib/hooks/useUserProfile";

import style from "./HeaderWrapper.module.css";

export function HeaderWrapper() {
  const pathname = usePathname();
  const { processAndImportFile, isUploading } = useImportWithUsernameCheck();
  const { user } = useAuth();
  const { hasUsername, loading: profileLoading } = useUserProfile();

  // Hide header on login page
  if (pathname === '/login') {
    return null;
  }

  return (
    <header className={style.header}>
      <Flex gap="5" align="center">
        <Link href="/">
          <div className={style.logoContainer}>
            <LogoSVG width={32} height={32} />
            <h1><Logotype /></h1>
          </div>
        </Link>

        <Flex gap="3" align="center">
        {isTrackerEnabled() && (
          <Button
            variant="soft"
            href="/pitch-tracker"
          >
            Tracker
          </Button>
        )}

        {isImportEnabled() && (
          <Button
            variant="soft"
            onClick={() => {
              // redirect to login if not authenticated
              if (!user) {
                window.location.href = '/login';
                return;
              }

              // redirect to settings if no username
              if (!profileLoading && !hasUsername) {
                window.location.href = '/profile/settings';
                return;
              }

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
            disabled={isUploading || profileLoading}
          >
            {isUploading ? 'Importing...' : 'Import'}
          </Button>
        )}
        </Flex>

      </Flex>

      <div className={style.headerActions}>

        <UserNav />
      </div>
    </header>
  );
}