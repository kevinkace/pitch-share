import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isTrackerEnabled, isDebugEnabled } from '@/lib/featureFlags';


const debugLog = (...args: any[]) => {
    if (isDebugEnabled()) {
        console.log(...args);
    }
};

export async function proxy(request: NextRequest) {
    debugLog('🚀 Proxy running for:', request.nextUrl.pathname);

    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));

                    supabaseResponse = NextResponse.next({
                        request,
                    });

                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    let {
        data: { user },
    } = await supabase.auth.getUser();

    // If no user found, attempt to refresh the session before redirecting
    if (!user) {
        try {
            const { data: { session } } = await supabase.auth.getSession();

            if (session && session.expires_at) {
                const now = Math.floor(Date.now() / 1000);
                const timeUntilExpiry = session.expires_at - now;

                // If token is expired or expires soon, try to refresh
                if (timeUntilExpiry <= 0) {
                    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();

                    if (!refreshError && refreshData.session && refreshData.user) {
                        user = refreshData.user;
                    }
                } else {
                    // Session is still valid, user should be available
                    user = session.user;
                }
            }
        } catch (refreshError) {
            if (isDebugEnabled()) {
                console.error('Session refresh failed in proxy:', refreshError);
            }
        }
    }

    // Check feature flags before authentication
    if (request.nextUrl.pathname === '/pitch-tracker' && !isTrackerEnabled()) {
        debugLog('🚫 Pitch tracker disabled, redirecting to home');
        const url = request.nextUrl.clone();
        url.pathname = '/';
        return NextResponse.redirect(url);
    }

    // Define public routes that don't require authentication
    const isPublicRoute =
        request.nextUrl.pathname === '/' ||
        request.nextUrl.pathname.startsWith('/login') ||
        request.nextUrl.pathname.startsWith('/auth') ||
        request.nextUrl.pathname.startsWith('/legal') ||
        request.nextUrl.pathname.match(/^\/users\/[^/]+\/sessions\/[^/]+$/);

    // Protected routes that require authentication
    const protectedRoutes = ['/profile', '/pitch-tracker'];
    const isProtectedRoute = protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route));

    // Redirect unauthenticated users away from protected routes
    if (isProtectedRoute && !user) {
        debugLog('🔒 User not authenticated, redirecting to login from:', request.nextUrl.pathname);
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    // Redirect authenticated users away from auth pages
    const authRoutes = ['/login', '/auth'];
    const isAuthRoute = authRoutes.some(route => request.nextUrl.pathname.startsWith(route));

    if (isAuthRoute && user) {
        debugLog('👤 Authenticated user accessing auth page, redirecting to home');
        const url = request.nextUrl.clone();
        url.pathname = '/';
        return NextResponse.redirect(url);
    }

    // Handle remaining non-protected routes for unauthenticated users
    if (!user && !isPublicRoute) {
        debugLog('🔒 User not authenticated, redirecting to login from:', request.nextUrl.pathname);
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    debugLog('✅ Access granted for:', request.nextUrl.pathname, user ? `(user: ${user.id})` : '(public route)');
    return supabaseResponse;
}

// Match all request paths except static files, images, and API routes
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - Static assets (svg, png, jpg, etc.)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ]
};