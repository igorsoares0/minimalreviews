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
    "reviewTemplate" TEXT NOT NULL DEFAULT 'classic',
    "emailProvider" TEXT NOT NULL DEFAULT 'sendgrid',
    "emailApiKey" TEXT,
    "emailFromName" TEXT NOT NULL DEFAULT 'Sua Loja',
    "emailFromAddress" TEXT,
    "mailtrapToken" TEXT,
    "mailtrapInboxId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_ReviewSettings" ("allowAnonymous", "autoPublish", "createdAt", "emailApiKey", "emailFromAddress", "emailFromName", "emailProvider", "id", "mailtrapInboxId", "mailtrapToken", "maxReviewLength", "requireApproval", "sendEmailNotification", "shop", "showOnProductPage", "starColor", "updatedAt") SELECT "allowAnonymous", "autoPublish", "createdAt", "emailApiKey", "emailFromAddress", "emailFromName", "emailProvider", "id", "mailtrapInboxId", "mailtrapToken", "maxReviewLength", "requireApproval", "sendEmailNotification", "shop", "showOnProductPage", "starColor", "updatedAt" FROM "ReviewSettings";
DROP TABLE "ReviewSettings";
ALTER TABLE "new_ReviewSettings" RENAME TO "ReviewSettings";
CREATE UNIQUE INDEX "ReviewSettings_shop_key" ON "ReviewSettings"("shop");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
