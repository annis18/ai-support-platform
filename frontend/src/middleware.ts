import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export default clerkMiddleware(async (auth, req) => {
  const path = req.nextUrl.pathname;
  
  // 1. Define public routes natively
  const isPublicRoute = path.startsWith('/sign-in') || 
                        path.startsWith('/sign-up') || 
                        path.startsWith('/api/webhooks');

  // 2. If the route is not public, verify the session
  if (!isPublicRoute) {
    const { userId } = await auth();
    
    // 3. Use NATIVE Next.js redirects instead of Clerk's deprecated functions
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};