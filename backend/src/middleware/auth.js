import { clerkMiddleware, getAuth } from '@clerk/express';

export const clerkAuth = clerkMiddleware();

export function requireAuth(req, res, next) {
  const auth = getAuth(req);

  // If authenticated, attach real IDs
  if (auth?.userId) {
    req.userId = auth.userId;
    req.orgId = auth.orgId || auth.userId;
  } else {
    // Fall back to query/body orgId for development
    // In production remove this fallback
    req.userId = 'dev-user';
    req.orgId = req.query.organizationId || req.body?.organizationId || 'default-org';
  }

  next();
}