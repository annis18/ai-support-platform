import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const publicRoutes = ['/sign-in', '/sign-up', '/api/webhooks'];

export default clerkMiddleware(async (auth, req) => {
  const path = req.nextUrl.pathname;
  const isPublic = publicRoutes.some(route => path.startsWith(route));

  if (!isPublic) {
    const session = await auth();
    if (!session.userId) {
      const signInUrl = new URL('/sign-in', req.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};