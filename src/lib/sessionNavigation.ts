import { readdirSync } from 'fs';
import path from 'path';

export interface SessionNavigation {
  previousSession: string | null;
  nextSession: string | null;
  previousDate: string | null;
  nextDate: string | null;
}

export async function getSessionNavigation(currentSession: string): Promise<SessionNavigation> {
  try {
    const dataDir = path.join(process.cwd(), 'src', 'lib', 'data');
    const files = readdirSync(dataDir)
      .filter(file => file.endsWith('_session.csv'))
      .map(filename => filename.replace('.csv', ''))
      .sort((a, b) => {
        // Extract date from filename (format: PR_YYYYMMDD_XXX_session)
        const dateA = a.match(/PR_(\d{8})/)?.[1] || '';
        const dateB = b.match(/PR_(\d{8})/)?.[1] || '';
        return dateA.localeCompare(dateB);
      });

    const currentIndex = files.indexOf(currentSession);

    if (currentIndex === -1) {
      return { previousSession: null, nextSession: null, previousDate: null, nextDate: null };
    }

    const previousSession = currentIndex > 0 ? files[currentIndex - 1] : null;
    const nextSession = currentIndex < files.length - 1 ? files[currentIndex + 1] : null;

    // Extract dates from session names
    const formatDate = (sessionName: string | null): string | null => {
      if (!sessionName) return null;
      const dateMatch = sessionName.match(/PR_(\d{4})(\d{2})(\d{2})/);
      if (!dateMatch) return null;
      const [, year, month, day] = dateMatch;
      return new Date(`${year}-${month}-${day}`).toLocaleDateString();
    };

    return {
      previousSession,
      nextSession,
      previousDate: formatDate(previousSession),
      nextDate: formatDate(nextSession)
    };
  } catch (error) {
    console.error('Error getting session navigation:', error);
    return { previousSession: null, nextSession: null, previousDate: null, nextDate: null };
  }
}