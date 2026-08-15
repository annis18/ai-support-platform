ALTER TABLE "Organization" ADD COLUMN "clerkOrgId" TEXT;
UPDATE "Organization" SET "clerkOrgId" = id WHERE "clerkOrgId" IS NULL;
ALTER TABLE "Organization" ALTER COLUMN "clerkOrgId" SET NOT NULL;
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_clerkOrgId_key" UNIQUE ("clerkOrgId");
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "plan" TEXT NOT NULL DEFAULT 'free';
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "stripeCustomerId" TEXT;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "stripeSubId" TEXT;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "messageCount" INTEGER NOT NULL DEFAULT 0;