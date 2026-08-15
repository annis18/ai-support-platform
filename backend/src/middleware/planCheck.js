import prisma from '../config/db.js';

const PLAN_LIMITS = {
  free: {
    maxDocuments: 3,
    maxMessagesPerMonth: 50,
  },
  pro: {
    maxDocuments: Infinity,
    maxMessagesPerMonth: Infinity,
  },
};

/**
 * checkDocumentLimit — runs before document upload.
 * Counts existing documents and blocks if over the plan limit.
 */
export async function checkDocumentLimit(req, res, next) {
  try {
    const org = await prisma.organization.findUnique({
      where: { clerkOrgId: req.orgId },
      include: { _count: { select: { documents: true } } },
    });

    if (!org) return next(); // org will be created on first upload

    const limit = PLAN_LIMITS[org.plan]?.maxDocuments ?? 3;
    const current = org._count.documents;

    if (current >= limit) {
      return res.status(403).json({
        error: `Document limit reached. Your ${org.plan} plan allows ${limit} documents. Upgrade to Pro for unlimited.`,
        upgradeRequired: true,
      });
    }

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * checkMessageLimit — runs before each chat message.
 * Tracks monthly usage and blocks if over the plan limit.
 */
export async function checkMessageLimit(req, res, next) {
  try {
    const org = await prisma.organization.findUnique({
      where: { clerkOrgId: req.orgId },
    });

    if (!org) return next();

    const limit = PLAN_LIMITS[org.plan]?.maxMessagesPerMonth ?? 50;

    if (org.messageCount >= limit) {
      return res.status(403).json({
        error: `Monthly message limit reached. Upgrade to Pro for unlimited messages.`,
        upgradeRequired: true,
      });
    }

    // Increment message count
    await prisma.organization.update({
      where: { id: org.id },
      data: { messageCount: { increment: 1 } },
    });

    next();
  } catch (error) {
    next(error);
  }
}
