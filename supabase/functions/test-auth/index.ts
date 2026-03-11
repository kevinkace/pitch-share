import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS headers for web requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    console.log('Testing auth - supabaseUrl:', supabaseUrl ? 'Present' : 'Missing');
    console.log('Testing auth - supabaseAnonKey:', supabaseAnonKey ? 'Present' : 'Missing');

    // Get user from JWT using anon key (for JWT validation)
    const authHeader = req.headers.get('Authorization');
    console.log('Auth header received:', authHeader ? 'Present' : 'Missing');

    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authorization header must start with "Bearer "' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('Token extracted, length:', token.length);

    if (!token || token.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Invalid token format - token is empty' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Basic JWT format validation (should have 3 parts separated by dots)
    const jwtParts = token.split('.');
    console.log('JWT parts analysis:', {
      totalParts: jwtParts.length,
      headerLength: jwtParts[0]?.length,
      payloadLength: jwtParts[1]?.length,
      signatureLength: jwtParts[2]?.length,
      tokenStart: token.substring(0, 20) + '...',
      tokenEnd: '...' + token.substring(token.length - 20)
    });

    if (jwtParts.length !== 3) {
      return new Response(
        JSON.stringify({ error: `Invalid JWT format - expected 3 parts, got ${jwtParts.length}` }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Try to decode JWT header for debugging (without verification)
    try {
      const headerDecoded = JSON.parse(atob(jwtParts[0]));
      console.log('JWT header:', headerDecoded);
    } catch (e) {
      console.log('Could not decode JWT header:', e.message);
    }

    // Create client with user's token for RLS-protected operations
    let supabase;
    try {
      supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });
      console.log('Supabase client created successfully');
    } catch (clientError) {
      console.error('Failed to create Supabase client:', clientError);
      return new Response(
        JSON.stringify({
          error: 'Failed to create Supabase client',
          details: clientError.message
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate the user token
    console.log('Validating user token...');
    let authResult;
    try {
      authResult = await supabase.auth.getUser();
      console.log('getUser() call completed');
    } catch (getUserError) {
      console.error('getUser() threw exception:', getUserError);
      return new Response(
        JSON.stringify({
          error: 'Token validation threw exception',
          details: getUserError.message
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: { user }, error: userError } = authResult;

    if (userError) {
      console.error('Auth validation error:', userError);
      return new Response(
        JSON.stringify({
          error: 'Token validation failed',
          details: userError.message,
          code: userError.status || 401
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!user) {
      console.error('No user found after token validation');
      return new Response(
        JSON.stringify({ error: 'No user found - token may be expired or invalid' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User validated successfully:', user.id, user.email);

    // Success! Just echo back the user info
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Authentication successful',
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at
        },
        tokenInfo: {
          length: token.length,
          parts: jwtParts.length,
          validFormat: true
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in test-auth:', error);
    console.error('Error stack:', error.stack);

    // Check if it's a specific auth error
    if (error.message?.includes('JWT') || error.message?.includes('Unauthorized')) {
      return new Response(
        JSON.stringify({
          error: 'Authentication failed',
          details: error.message,
          code: 401
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: error.message,
        type: error.constructor.name
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});