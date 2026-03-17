import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleCors, validateMethod, createJsonResponse, createErrorResponse } from '../_shared/cors.ts';
import { authenticateRequest, validateEnvironment } from '../_shared/auth.ts';

interface UserDataExport {
  user: {
    id: string;
    email?: string;
    created_at?: string;
  };
  sessions: any[];
  pitches: any[];
  exportedAt: string;
  version: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  // Only allow POST requests
  const methodResponse = validateMethod(req, ['POST']);
  if (methodResponse) return methodResponse;

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

    // Create Supabase client with user token for data fetching
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: req.headers.get('Authorization')!,
        },
      },
    });

    console.log(`Downloading data for user: ${user.id}`);

    // Fetch all user sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError);
      return createErrorResponse({
        error: 'Failed to fetch sessions',
        details: sessionsError.message
      }, 500);
    }

    // Fetch all user pitches
    const { data: pitches, error: pitchesError } = await supabase
      .from('pitches')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (pitchesError) {
      console.error('Error fetching pitches:', pitchesError);
      return createErrorResponse({
        error: 'Failed to fetch pitches',
        details: pitchesError.message
      }, 500);
    }

    // Create data export object
    const userDataExport: UserDataExport = {
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      },
      sessions: sessions || [],
      pitches: pitches || [],
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };

    console.log(`Data export complete: ${sessions?.length || 0} sessions, ${pitches?.length || 0} pitches`);

    return createJsonResponse(
      userDataExport,
      200,
      {
        'Content-Disposition': `attachment; filename="pitch-share-data-${user.id}-${new Date().toISOString().split('T')[0]}.json"`
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return createErrorResponse({
      error: 'Internal server error',
      details: error.message
    }, 500);
  }
});