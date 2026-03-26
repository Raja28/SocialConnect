// import { NextResponse } from "next/server";
// import { NextRequest } from "next/server";

// export function middleware(req: NextRequest) {
//   const token = req.cookies.get("token")?.value;

//   const isPublicPage =
//     req.nextUrl.pathname.startsWith("/") ||
//     req.nextUrl.pathname.startsWith("/register");

//   console.log('-------------->', req.nextUrl.pathname);

//   // if (isPublicPage && token) {
//   //   return NextResponse.redirect(new URL("/home", req.url));
//   // }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/", "/register", "/home"],
// };

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith("/api/");
  const isPublicPage = pathname === "/" || pathname.startsWith("/register");
  const isProtectedPage = pathname.startsWith("/home") || pathname.startsWith("/profile");

  // 1) If no token, allow only public GET endpoints.
  if (!token) {
    const isGet = request.method === "GET";

    const isPublicPostsGet = isGet && pathname.startsWith("/api/posts");
    // Followers/following are treated as protected (current-user only).

    const isProtected =
      pathname.startsWith("/api/user") ||
      pathname.startsWith("/api/feed") ||
      pathname.startsWith("/api/users") ||
      pathname.startsWith("/api/posts");

    if (isProtected && !isPublicPostsGet) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Pages: redirect unauthenticated users away from protected pages.
    if (!isApi && isProtectedPage) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  try {
    // 2. Verify the JWT
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token!, secret);

    // 3. Clone headers and add the user_id (req.user equivalent)
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.id as string);
    requestHeaders.set('x-user-email', payload.email as string);

    // Pages: if logged in, block access to login/register.
    if (!isApi && isPublicPage) {
      const url = request.nextUrl.clone();
      url.pathname = "/home";
      return NextResponse.redirect(url);
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (err) {
    // Invalid token: APIs return JSON; pages redirect to login.
    if (!isApi) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    return NextResponse.json({ error: "Invalid Token" }, { status: 401 });
  }
}

// 4. Only run middleware on these paths
export const config = {
  matcher: [
    '/',
    '/register/:path*',
    '/home/:path*',
    '/api/user/:path*',
    '/api/posts/:path*',
    '/api/feed/:path*',
    '/api/users/:path*',
    '/profile/:path*',
  ],
};