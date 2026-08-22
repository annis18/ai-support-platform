export default function middleware() {}

export const config = {
  matcher: ['/((?!_next|.*\\..*|_next/static|_next/image|favicon.ico).*)', '/', '/(api|trpc)(.*)'],
};