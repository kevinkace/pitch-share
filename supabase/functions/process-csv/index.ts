import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

import { handleCors, createJsonResponse, createErrorResponse } from '../_shared/cors.ts';
import { authenticateRequest, validateEnvironment } from '../_shared/auth.ts';

interface PitchRow {
  Date: string;
  Time: string;
  'Session Title': string;
  Count: string;
  Speed: string;
  Unit: string;
  'Pitch View': string;
  'Pitch Zone': string;
  'Pitch Type': string;
  'Player Name': string;
  Sport: string;
  Activity: string;
  Video: string;
}

interface ProcessCsvRequest {
  filePath: string;
  isPrivate?: boolean;
}

function parseCSV(csvText: string): PitchRow[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const rows: PitchRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length !== headers.length) continue;

    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });
    rows.push(row as PitchRow);
  }

  return rows;
}

function generateSessionId(firstRow: PitchRow): string {
  // Generate session ID from date/time: PR_20260131_427_session
  const dateParts = firstRow.Date.split('/');
  const year = dateParts[2];
  const month = dateParts[0].padStart(2, '0');
  const day = dateParts[1].padStart(2, '0');

  const timeParts = firstRow.Time.replace(/[^\d:]/g, '').split(':');
  const hour = timeParts[0].padStart(2, '0');
  const minute = timeParts[1].padStart(2, '0');

  return `PR_${year}${month}${day}_${hour}${minute}_session`;
}

function calculateSessionStats(pitchRows: PitchRow[]) {
  const speeds = pitchRows
    .map(row => parseFloat(row.Speed))
    .filter(speed => !isNaN(speed));

  const fastestSpeed = speeds.length > 0 ? Math.max(...speeds) : 0;
  const averageSpeed = speeds.length > 0 ?
    Math.round(speeds.reduce((a, b) => a + b, 0) / speeds.length) : 0;

  return {
    pitchCount: pitchRows.length,
    fastestSpeed,
    averageSpeed,
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Validate environment variables
    const envValidation = validateEnvironment(['SUPABASE_URL', 'SUPABASE_ANON_KEY']);
    if (!envValidation.success) {
      return envValidation.response;
    }

    // Authenticate user
    const authResult = await authenticateRequest(req, supabaseUrl, supabaseAnonKey);
    if (!authResult.success) {
      return authResult.response;
    }

    const user = authResult.user;

    // Create Supabase client with user token for RLS-protected operations
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: req.headers.get('Authorization')!,
        },
      },
    });

    if (!user) {
      console.error('No user found after token validation');
      return createErrorResponse('No user found - token may be expired or invalid', 401);
    }

    const { filePath, isPrivate = true }: ProcessCsvRequest = await req.json();

    // Read CSV file from storage
    const { data: fileData, error: fileError } = await supabase.storage
      .from('csv-uploads')
      .download(filePath);

    if (fileError) {
      throw new Error(`Failed to read file: ${fileError.message}`);
    }

    const csvText = await fileData.text();
    const pitchRows = parseCSV(csvText);

    if (pitchRows.length === 0) {
      throw new Error('No valid pitch data found in CSV');
    }

    // Generate session ID and calculate stats
    const sessionId = generateSessionId(pitchRows[0]);
    const { pitchCount, fastestSpeed, averageSpeed } = calculateSessionStats(pitchRows);

    // Insert session record
    const sessionData = {
      id: sessionId,
      user_id: user.id,
      player_name: pitchRows[0]['Player Name'],
      date: pitchRows[0].Date,
      sport: pitchRows[0].Sport,
      activity: pitchRows[0].Activity,
      unit: pitchRows[0].Unit,
      pitch_count: pitchCount,
      fastest_speed: fastestSpeed,
      average_speed: averageSpeed,
      csv_file_path: filePath,
      is_private: isPrivate,
    };

    const { error: sessionError } = await supabase
      .from('sessions')
      .insert([sessionData]);

    if (sessionError) {
      throw new Error(`Failed to create session: ${sessionError.message}`);
    }

    // Insert pitch records
    const pitchData = pitchRows.map(row => ({
      user_id: user.id,
      session_id: sessionId,
      count: parseInt(row.Count) || null,
      date: row.Date,
      time: row.Time,
      speed: parseFloat(row.Speed) || null,
      unit: row.Unit,
      pitch_view: row['Pitch View'],
      pitch_zone: row['Pitch Zone'],
      pitch_type: row['Pitch Type'],
      player_name: row['Player Name'],
      sport: row.Sport,
      activity: row.Activity,
      video: row.Video,
    }));

    const { error: pitchError } = await supabase
      .from('pitches')
      .insert(pitchData);

    if (pitchError) {
      throw new Error(`Failed to insert pitches: ${pitchError.message}`);
    }

    return createJsonResponse({
      success: true,
      sessionId,
      pitchCount,
      fastestSpeed,
      averageSpeed
    });

  } catch (error) {
    console.error('Error processing CSV:', error);
    console.error('Error stack:', error.stack);

    // Check if it's a specific auth error
    if (error.message?.includes('JWT') || error.message?.includes('Unauthorized')) {
      return createErrorResponse({
        error: 'Authentication failed',
        details: error.message,
        code: 401
      }, 401);
    }

    return createErrorResponse({
      error: error.message,
      type: error.constructor.name
    }, 500);
  }
});