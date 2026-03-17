import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

import { handleCors, validateMethod, createJsonResponse, createErrorResponse } from '../_shared/cors.ts';
import { authenticateRequest, validateEnvironment } from '../_shared/auth.ts';

interface DeleteAccountRequest {
  confirmation: string; // User must type "DELETE MY ACCOUNT" to confirm
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
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!; // Need service key for user deletion
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Validate environment variables
    const envValidation = validateEnvironment(['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_ANON_KEY']);
    if (!envValidation.success) {
      return envValidation.response;
    }

    // Parse request body
    let requestData: DeleteAccountRequest;
    try {
      requestData = await req.json();
    } catch (error) {
      return createErrorResponse('Invalid JSON in request body');
    }

    // Validate confirmation text
    if (requestData.confirmation !== 'DELETE MY ACCOUNT') {
      return createErrorResponse({
        error: 'Invalid confirmation',
        message: 'You must type "DELETE MY ACCOUNT" exactly to confirm account deletion'
      });
    }

    // Authenticate user
    const authResult = await authenticateRequest(req, supabaseUrl, supabaseAnonKey);
    if (!authResult.success) {
      return authResult.response;
    }

    const user = authResult.user;
    const userId = user.id;
    console.log(`Starting account deletion for user: ${userId}`);

    // Create user client for RLS-protected queries and admin client for deletions
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: req.headers.get('Authorization')!,
        },
      },
    });

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
      return createErrorResponse({
        error: 'Failed to prepare for deletion',
        details: sessionsError.message
      }, 500);
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
      return createJsonResponse({
        error: 'Account deletion completed with errors',
        details: deletionResults
      }, 207); // Multi-status
    }

    return createJsonResponse({
      success: true,
      message: 'Account successfully deleted',
      details: deletionResults
    });

  } catch (error) {
    console.error('Unexpected error during account deletion:', error);
    return createErrorResponse({
      error: 'Internal server error during account deletion',
      details: error.message
    }, 500);
  }
});