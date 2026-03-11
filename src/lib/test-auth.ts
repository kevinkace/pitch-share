// Simple test function for the test-auth edge function
// You can call this from browser console or add a button to call it

export async function testAuth() {
  try {
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();

    console.log('Environment check:');
    console.log('- NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY length:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length);

    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('Session error:', sessionError);
      return { error: 'Session error: ' + sessionError.message };
    }

    if (!session) {
      console.error('No session found');
      return { error: 'No session found - user not logged in' };
    }

    if (!session.access_token) {
      console.error('No access token in session');
      return { error: 'No access token found' };
    }

    // Debug token details
    console.log('Token debugging:');
    console.log('- Token length:', session.access_token.length);
    console.log('- Token start:', session.access_token.substring(0, 20) + '...');
    console.log('- Token end:', '...' + session.access_token.substring(session.access_token.length - 20));
    console.log('- Token parts:', session.access_token.split('.').length);
    console.log('- Expires at:', session.expires_at, new Date(session.expires_at! * 1000));
    console.log('- Current time:', Math.floor(Date.now() / 1000), new Date());
    console.log('- Time to expiry (seconds):', session.expires_at! - Math.floor(Date.now() / 1000));

    // Call test-auth edge function (deployed)
    const apiUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/test-auth`;
    console.log('Calling:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({})
    });

    const responseText = await response.text();
    console.log('Raw response:', responseText);

    if (!response.ok) {
      console.error('API Error Response:', responseText);
      return { error: responseText, status: response.status };
    }

    const result = JSON.parse(responseText);
    console.log('Auth test result:', result);

    return result;

  } catch (error) {
    console.error('Test auth error:', error);
    return { error: error.message };
  }
}

// To test from browser console:
// testAuth().then(console.log)