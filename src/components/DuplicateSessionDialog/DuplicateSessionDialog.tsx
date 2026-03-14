'use client';

import { AlertDialog, Button, Flex, Text, Strong } from '@radix-ui/themes';
import { InfoCircledIcon } from '@radix-ui/react-icons';

interface Session {
  id: string;
  player_name: string;
  date: string;
  csv_file_path?: string;
}

interface DuplicateSessionDialogProps {
  open: boolean;
  onViewExisting: () => void;
  onImportAnyway: () => void;
  filename: string;
  existingSession: Session;
}

export function DuplicateSessionDialog({
  open,
  onViewExisting,
  onImportAnyway,
  filename,
  existingSession
}: DuplicateSessionDialogProps) {
  const sessionDate = existingSession.date || 'Unknown Date';
  const playerName = existingSession.player_name || 'Unknown Player';

  return (
    <AlertDialog.Root open={open}>
      <AlertDialog.Content style={{ maxWidth: 450 }}>
        <AlertDialog.Title size="5">
          <Flex gap="2" align="center">
            <InfoCircledIcon width="20" height="20" />
            Duplicate Session Found
          </Flex>
        </AlertDialog.Title>

        <AlertDialog.Description size="3" mb="4">
          <Text>
            You already have a session with file <Strong>"{filename}"</Strong>
          </Text>
        </AlertDialog.Description>

        <Flex direction="column" gap="3" mb="5">
          <Text size="2" color="gray">
            <Strong>Player:</Strong> {playerName}
          </Text>
          <Text size="2" color="gray">
            <Strong>Date:</Strong> {sessionDate}
          </Text>
        </Flex>

        <Flex gap="3" mt="4" justify="end">
          <AlertDialog.Cancel>
            <Button variant="soft" size="2" onClick={onImportAnyway}>
              Import Anyway
            </Button>
          </AlertDialog.Cancel>
          
          <AlertDialog.Action>
            <Button size="2" onClick={onViewExisting}>
              View Existing Session
            </Button>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}