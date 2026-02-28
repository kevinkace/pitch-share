import { readdirSync } from 'fs';
import path from 'path';

export interface SessionNavigation {
  previousSession: string | null;
  nextSession: string | null;
}

export async function getSessionNavigation(currentSession: string): Promise<SessionNavigation> {
  try {
    const dataDir = path.join(process.cwd(), 'src', 'lib', 'data');
    const files = readdirSync(dataDir)
      .filter(file => file.endsWith('.csv'))
      .map(filename => filename.replace('.csv', ''))
      .sort((a, b) => {
        // Extract date from filename (format: PR_YYYYMMDD_XXX_session)
        const dateA = a.match(/PR_(\d{8})/)?.[1] || '';
        const dateB = b.match(/PR_(\d{8})/)?.[1] || '';
        return dateA.localeCompare(dateB);
      });

    const currentIndex = files.indexOf(currentSession);

    if (currentIndex === -1) {
      return { previousSession: null, nextSession: null };
    }

    const previousSession = currentIndex > 0 ? files[currentIndex - 1] : null;
    const nextSession = currentIndex < files.length - 1 ? files[currentIndex + 1] : null;

    return {
      previousSession,
      nextSession
    };
  } catch (error) {
    console.error('Error getting session navigation:', error);
    return { previousSession: null, nextSession: null };
  }
}