// CORS headers for web requests
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

/**
 * Handle CORS preflight requests
 * @param req The incoming request
 * @returns Response for OPTIONS requests, null for other methods
 */
export function handleCors(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  return null;
}

/**
 * Create a JSON response with CORS headers
 * @param data The data to return as JSON
 * @param status HTTP status code (default 200)
 * @param additionalHeaders Any additional headers to include
 * @returns Response with JSON data and CORS headers
 */
export function createJsonResponse(
  data: any,
  status: number = 200,
  additionalHeaders: Record<string, string> = {}
): Response {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        ...additionalHeaders
      }
    }
  );
}

/**
 * Create an error response with CORS headers
 * @param error Error message or object
 * @param status HTTP status code (default 400)
 * @returns Response with error and CORS headers
 */
export function createErrorResponse(error: string | object, status: number = 400): Response {
  return createJsonResponse(
    typeof error === 'string' ? { error } : error,
    status
  );
}

/**
 * Validate request method and return error response if invalid
 * @param req The incoming request
 * @param allowedMethods Array of allowed HTTP methods
 * @returns Error response if method not allowed, null if valid
 */
export function validateMethod(req: Request, allowedMethods: string[]): Response | null {
  if (!allowedMethods.includes(req.method)) {
    return createErrorResponse('Method not allowed', 405);
  }
  return null;
}