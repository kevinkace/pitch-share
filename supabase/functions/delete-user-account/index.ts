import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS headers for web requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

interface DeleteAccountRequest {
  confirmation: string; // User must type "DELETE MY ACCOUNT" to confirm
}

Deno.serve(async (req) => {
  const { method } = req;

  // Handle CORS preflight requests
  if (method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Only allow POST requests
  if (method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!; // Need service key for user deletion
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    if (!supabaseServiceKey) {
      console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid Authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Basic JWT format validation
    const jwtParts = token.split('.');
    if (jwtParts.length !== 3) {
      return new Response(
        JSON.stringify({ error: 'Invalid JWT format' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse request body
    let requestData: DeleteAccountRequest;
    try {
      requestData = await req.json();
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate confirmation text
    if (requestData.confirmation !== 'DELETE MY ACCOUNT') {
      return new Response(
        JSON.stringify({
          error: 'Invalid confirmation',
          message: 'You must type "DELETE MY ACCOUNT" exactly to confirm account deletion'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create Supabase client with user token to validate identity
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    // Validate the user token and get user ID
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();

    if (userError || !user) {
      console.error('Auth validation error:', userError);
      return new Response(
        JSON.stringify({
          error: 'Authentication failed',
          details: userError?.message || 'No user found'
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const userId = user.id;
    console.log(`Starting account deletion for user: ${userId}`);

    // Create admin client for deletions
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Track deletion progress
    const deletionResults = {
      csvFiles: { count: 0, errors: [] as string[] },
      pitches: { count: 0, errors: [] as string[] },
      sessions: { count: 0, errors: [] as string[] },
      userAccount: { success: false, error: null as string | null }
    };

    // Step 1: Get all sessions to find CSV files to delete
    console.log('Fetching user sessions to identify CSV files...');
    const { data: sessions, error: sessionsError } = await supabaseUser
      .from('sessions')
      .select('id, csv_file_path')
      .eq('user_id', userId);

    if (sessionsError) {
      console.error('Error fetching sessions for deletion:', sessionsError);
      return new Response(
        JSON.stringify({
          error: 'Failed to prepare for deletion',
          details: sessionsError.message
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Step 2: Delete CSV files from storage
    if (sessions && sessions.length > 0) {
      console.log(`Deleting CSV files for ${sessions.length} sessions...`);

      for (const session of sessions) {
        if (session.csv_file_path) {
          try {
            const { error: deleteError } = await supabaseAdmin.storage
              .from('csv-uploads')
              .remove([session.csv_file_path]);

            if (deleteError) {
              console.warn(`Failed to delete CSV file ${session.csv_file_path}:`, deleteError);
              deletionResults.csvFiles.errors.push(`${session.csv_file_path}: ${deleteError.message}`);
            } else {
              deletionResults.csvFiles.count++;
            }
          } catch (error) {
            console.warn(`Exception deleting CSV file ${session.csv_file_path}:`, error);
            deletionResults.csvFiles.errors.push(`${session.csv_file_path}: ${error.message}`);
          }
        }
      }
    }

    // Step 3: Delete all user pitches (child records first)
    console.log('Deleting user pitches...');
    const { count: pitchCount, error: pitchesError } = await supabaseAdmin
      .from('pitches')
      .delete()
      .eq('user_id', userId)
      .select('*', { count: 'exact', head: true });

    if (pitchesError) {
      console.error('Error deleting pitches:', pitchesError);
      deletionResults.pitches.errors.push(pitchesError.message);
    } else {
      deletionResults.pitches.count = pitchCount || 0;
      console.log(`Deleted ${pitchCount || 0} pitches`);
    }

    // Step 4: Delete all user sessions
    console.log('Deleting user sessions...');
    const { count: sessionCount, error: sessionDeleteError } = await supabaseAdmin
      .from('sessions')
      .delete()
      .eq('user_id', userId)
      .select('*', { count: 'exact', head: true });

    if (sessionDeleteError) {
      console.error('Error deleting sessions:', sessionDeleteError);
      deletionResults.sessions.errors.push(sessionDeleteError.message);
    } else {
      deletionResults.sessions.count = sessionCount || 0;
      console.log(`Deleted ${sessionCount || 0} sessions`);
    }

    // Step 5: Delete the user account itself
    console.log('Deleting user account...');
    const { error: userDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (userDeleteError) {
      console.error('Error deleting user account:', userDeleteError);
      deletionResults.userAccount.error = userDeleteError.message;
    } else {
      deletionResults.userAccount.success = true;
      console.log(`Successfully deleted user account: ${userId}`);
    }

    // Check if any critical errors occurred
    const hasCriticalErrors =
      deletionResults.pitches.errors.length > 0 ||
      deletionResults.sessions.errors.length > 0 ||
      !deletionResults.userAccount.success;

    if (hasCriticalErrors) {
      return new Response(
        JSON.stringify({
          error: 'Account deletion completed with errors',
          details: deletionResults
        }),
        {
          status: 207, // Multi-status
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Account successfully deleted',
        details: deletionResults
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Unexpected error during account deletion:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error during account deletion',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});