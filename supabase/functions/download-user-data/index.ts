import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS headers for web requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

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
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

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

    // Create Supabase client with user token
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    // Validate the user token
    const { data: { user }, error: userError } = await supabase.auth.getUser();

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

    console.log(`Downloading data for user: ${user.id}`);

    // Fetch all user sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError);
      return new Response(
        JSON.stringify({
          error: 'Failed to fetch sessions',
          details: sessionsError.message
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Fetch all user pitches
    const { data: pitches, error: pitchesError } = await supabase
      .from('pitches')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (pitchesError) {
      console.error('Error fetching pitches:', pitchesError);
      return new Response(
        JSON.stringify({
          error: 'Failed to fetch pitches',
          details: pitchesError.message
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
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

    return new Response(
      JSON.stringify(userDataExport),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="pitch-share-data-${user.id}-${new Date().toISOString().split('T')[0]}.json"`
        }
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});