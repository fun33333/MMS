import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const token = request.cookies.get('access_token')?.value;
    const { pathname } = request.nextUrl;

    // 1. Auth Check: Redirect to login if no token for protected routes
    if (pathname !== '/login' && !token && !pathname.includes('.')) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 2. Login Page: Redirect to home if already logged in
    if (pathname === '/login' && token) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // 3. Role-Based Access Control (RBAC) via JWT Decoding
    if (token) {
        try {
            // Manual JWT decode to avoid external lib issues in Edge Runtime
            const payloadBase64 = token.split('.')[1];
            if (payloadBase64) {
                const decodedJson = JSON.parse(atob(payloadBase64));
                const isAdmin = decodedJson.isAdmin; // Custom claim from backend

                // RESTRICTED ROUTES FOR NON-ADMINS
                if (!isAdmin) {
                    // Block access to Add/Edit pages or specific restricted paths
                    if (pathname.startsWith('/students/add')) {
                        return NextResponse.redirect(new URL('/students', request.url));
                    }
                }
            }
        } catch (e) {
            console.error("Middleware token parse error", e);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
