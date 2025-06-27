-- CreateTable
CREATE TABLE "ReviewInvitation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "customerId" TEXT,
    "customerEmail" TEXT NOT NULL,
    "customerName" TEXT,
    "productId" TEXT NOT NULL,
    "productTitle" TEXT NOT NULL,
    "productImage" TEXT,
    "scheduledFor" DATETIME NOT NULL,
    "sentAt" DATETIME,
    "opened" BOOLEAN NOT NULL DEFAULT false,
    "clicked" BOOLEAN NOT NULL DEFAULT false,
    "responded" BOOLEAN NOT NULL DEFAULT false,
    "reminderCount" INTEGER NOT NULL DEFAULT 0,
    "token" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ReviewSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "autoPublish" BOOLEAN NOT NULL DEFAULT true,
    "requireApproval" BOOLEAN NOT NULL DEFAULT false,
    "allowAnonymous" BOOLEAN NOT NULL DEFAULT true,
    "sendEmailNotification" BOOLEAN NOT NULL DEFAULT true,
    "showOnProductPage" BOOLEAN NOT NULL DEFAULT true,
    "starColor" TEXT NOT NULL DEFAULT '#FFD700',
    "maxReviewLength" INTEGER NOT NULL DEFAULT 500,
    "emailProvider" TEXT NOT NULL DEFAULT 'sendgrid',
    "emailApiKey" TEXT,
    "emailFromName" TEXT NOT NULL DEFAULT 'Sua Loja',
    "emailFromAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_ReviewSettings" ("allowAnonymous", "autoPublish", "createdAt", "id", "maxReviewLength", "requireApproval", "sendEmailNotification", "shop", "showOnProductPage", "starColor", "updatedAt") SELECT "allowAnonymous", "autoPublish", "createdAt", "id", "maxReviewLength", "requireApproval", "sendEmailNotification", "shop", "showOnProductPage", "starColor", "updatedAt" FROM "ReviewSettings";
DROP TABLE "ReviewSettings";
ALTER TABLE "new_ReviewSettings" RENAME TO "ReviewSettings";
CREATE UNIQUE INDEX "ReviewSettings_shop_key" ON "ReviewSettings"("shop");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "ReviewInvitation_token_key" ON "ReviewInvitation"("token");

-- CreateIndex
CREATE INDEX "ReviewInvitation_shop_scheduledFor_idx" ON "ReviewInvitation"("shop", "scheduledFor");

-- CreateIndex
CREATE INDEX "ReviewInvitation_shop_sentAt_idx" ON "ReviewInvitation"("shop", "sentAt");

-- CreateIndex
CREATE INDEX "ReviewInvitation_token_idx" ON "ReviewInvitation"("token");
