'use client';

import { useState, useEffect } from 'react';
import Container from '@/components/Container/Container';
import SessionView from '@/components/SessionView/SessionView';
import { SessionProvider } from '@/lib/contexts/SessionContext';

interface ProfileSessionPageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

export default function ProfileSessionPage({ params }: ProfileSessionPageProps) {
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    async function loadParams() {
      const resolvedParams = await params;
      setSessionId(resolvedParams.sessionId);
    }
    loadParams();
  }, [params]);

  if (!sessionId) {
    return (
      <Container>
        <p>Loading...</p>
      </Container>
    );
  }

  return (
      <SessionProvider sessionId={sessionId} requireAuth={true}>
        <SessionView />
      </SessionProvider>
  );
}