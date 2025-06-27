-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "customerId" TEXT,
    "customerName" TEXT,
    "customerEmail" TEXT,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "content" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "helpful" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ReviewSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "autoPublish" BOOLEAN NOT NULL DEFAULT true,
    "requireApproval" BOOLEAN NOT NULL DEFAULT false,
    "allowAnonymous" BOOLEAN NOT NULL DEFAULT true,
    "sendEmailNotification" BOOLEAN NOT NULL DEFAULT true,
    "showOnProductPage" BOOLEAN NOT NULL DEFAULT true,
    "starColor" TEXT NOT NULL DEFAULT '#FFD700',
    "maxReviewLength" INTEGER NOT NULL DEFAULT 500,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Review_shop_productId_idx" ON "Review"("shop", "productId");

-- CreateIndex
CREATE INDEX "Review_shop_published_idx" ON "Review"("shop", "published");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewSettings_shop_key" ON "ReviewSettings"("shop");
