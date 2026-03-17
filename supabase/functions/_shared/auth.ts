import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createErrorResponse } from './cors.ts';

/**
 * Validate authorization header and extract JWT token
 * @param authHeader The Authorization header value
 * @returns Object with success flag, token (if valid), or error response
 */
export function validateAuthHeader(authHeader: string | null):
  { success: true; token: string } | { success: false; response: Response } {

  if (!authHeader) {
    return {
      success: false,
      response: createErrorResponse('Missing Authorization header', 401)
    };
  }

  if (!authHeader.startsWith('Bearer ')) {
    return {
      success: false,
      response: createErrorResponse('Authorization header must start with "Bearer "', 401)
    };
  }

  const token = authHeader.replace('Bearer ', '');

  if (!token || token.trim() === '') {
    return {
      success: false,
      response: createErrorResponse('Invalid token format - token is empty', 401)
    };
  }

  return { success: true, token };
}

/**
 * Validate user authentication using Supabase
 * @param token JWT token
 * @param supabaseUrl Supabase URL
 * @param supabaseKey Supabase key (anon or service)
 * @returns Object with success flag and user data or error response
 */
export async function validateUser(
  token: string,
  supabaseUrl: string,
  supabaseKey: string
): Promise<{ success: true; user: any } | { success: false; response: Response }> {

  try {
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.error('Auth validation error:', error);
      return {
        success: false,
        response: createErrorResponse({
          error: 'Token validation failed',
          details: error.message
        }, 401)
      };
    }

    if (!user) {
      return {
        success: false,
        response: createErrorResponse('No user found - token may be expired or invalid', 401)
      };
    }

    return { success: true, user };

  } catch (error) {
    console.error('Error validating user:', error);
    return {
      success: false,
      response: createErrorResponse({
        error: 'Authentication failed',
        details: error.message
      }, 401)
    };
  }
}

/**
 * Complete authentication flow: validate header and user
 * @param req The incoming request
 * @param supabaseUrl Supabase URL
 * @param supabaseKey Supabase key (anon or service)
 * @returns Object with success flag and user data or error response
 */
export async function authenticateRequest(
  req: Request,
  supabaseUrl: string,
  supabaseKey: string
): Promise<{ success: true; user: any } | { success: false; response: Response }> {

  const authValidation = validateAuthHeader(req.headers.get('Authorization'));

  if (!authValidation.success) {
    return authValidation;
  }

  return await validateUser(authValidation.token, supabaseUrl, supabaseKey);
}

/**
 * Check if required environment variables are present
 * @param variables Array of environment variable names to check
 * @returns Object with success flag and missing variables or error response
 */
export function validateEnvironment(variables: string[]):
  { success: true } | { success: false; response: Response; missing: string[] } {

  const missing = variables.filter(varName => !Deno.env.get(varName));

  if (missing.length > 0) {
    console.error('Missing environment variables:', missing);
    return {
      success: false,
      missing,
      response: createErrorResponse('Server configuration error', 500)
    };
  }

  return { success: true };
}