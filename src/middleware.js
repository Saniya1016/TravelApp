import { NextResponse } from "next/server";

function isAllowedOrigin(origin) {
  if (!origin) return true;

  // Create array of allowed origins
  const allowedOrigins = [
    'http://localhost:3000',
    'https://travel-budget-ai-ci31.vercel.app'
  ];

  // Add NEXT_PUBLIC_SITE_URL if it exists
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    allowedOrigins.push(process.env.NEXT_PUBLIC_SITE_URL);
  }

  // Direct match for exact origins
  if (allowedOrigins.includes(origin)) {
    return true;
  }

  // Check for Vercel preview deployments
  const vercelPreviewRegex = /^https:\/\/travel-budget-ai-ci31-[a-zA-Z0-9-]+-saniya1016s-projects\.vercel\.app$/;
  if (vercelPreviewRegex.test(origin)) {
    return true;
  }

  return false;
}

function addCorsHeaders(response, origin) {
  console.log("origin: ", origin);
  if (!isAllowedOrigin(origin)) return;

  // response.headers.set('Access-Control-Allow-Origin', origin);
  if (!origin) {
    // For localhost development
    response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3000');
  } else {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version');
}

export async function middleware(request) {
  const origin = request.headers.get('origin');
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 200 });
    addCorsHeaders(response, origin);
    return response;
  }

  // For protected routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('authToken');

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/auth`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.value}`,
        },
      });

      if (!res.ok) {
        return NextResponse.redirect(new URL('/login', request.url));
      }

      const data = await res.json();
      const response = NextResponse.next();
      addCorsHeaders(response, origin);
      response.headers.set('user-id', data.userId);
      return response;
    } catch (error) {
      console.error('Middleware error:', error);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // For API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    const response = NextResponse.next();
    addCorsHeaders(response, origin);
    return response;
  }

  // For all other routes
  const response = NextResponse.next();
  addCorsHeaders(response, origin);
  return response;
}

export const config = {
  matcher: [
    '/api/:path((?!auth).*)',
    '/dashboard/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};