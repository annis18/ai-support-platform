import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware(async (auth, req) => {
  const path = req.nextUrl.pathname;
  
  // 1. Define public routes using native string matching
  const isPublicRoute = path.startsWith('/sign-in') || 
                        path.startsWith('/sign-up') || 
                        path.startsWith('/api/webhooks');

  // 2. If the route is not public, force the user to authenticate
  if (!isPublicRoute) {
    // Wait for the auth function to resolve, then call protect
    const { protect } = await auth();
    protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files (images, css, etc.)
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};