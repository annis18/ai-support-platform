import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Leave this empty unless you have specific API webhooks that need to remain public
const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)', '/api/webhooks(.*)']);

export default clerkMiddleware(async (auth, req) => {
  // If the route is not public, force the user to authenticate
  if (!isPublicRoute(req)) {
    await auth.protect();
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