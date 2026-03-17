'use client';

import { useState, useEffect } from 'react';
import Container from '@/components/Container/Container';
import SessionView from '@/components/SessionView/SessionView';
import { SessionProvider } from '@/lib/contexts/SessionContext';

interface SessionPageProps {
  params: Promise<{
    userId: string;
    sessionId: string;
  }>;
}

function SessionContent() {
  return <SessionView />;
}

export default function SessionPage({ params }: SessionPageProps) {
  const [userId, setUserId] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    async function loadParams() {
      const resolvedParams = await params;
      setUserId(resolvedParams.userId);
      setSessionId(resolvedParams.sessionId);
    }
    loadParams();
  }, [params]);

  if (!userId || !sessionId) {
    return (
      <Container>
        <p>Loading...</p>
      </Container>
    );
  }

  return (
    <Container>
      <SessionProvider sessionId={sessionId} userId={userId} requireAuth={false}>
        <SessionContent />
      </SessionProvider>
    </Container>
  );
}