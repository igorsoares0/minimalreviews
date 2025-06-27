-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" TIMESTAMP(3),
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "accountOwner" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT,
    "collaborator" BOOLEAN DEFAULT false,
    "emailVerified" BOOLEAN DEFAULT false,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
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
    "mediaUrls" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewSettings" (
    "id" TEXT NOT NULL,
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
    "externalApiUrl" TEXT,
    "rwsBaseUrl" TEXT NOT NULL DEFAULT 'https://rws-three.vercel.app',
    "autoSendEnabled" BOOLEAN NOT NULL DEFAULT false,
    "autoSendDaysAfter" INTEGER NOT NULL DEFAULT 7,
    "autoSendMaxReminders" INTEGER NOT NULL DEFAULT 2,
    "autoSendReminderDays" INTEGER NOT NULL DEFAULT 7,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReviewSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewInvitation" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "customerId" TEXT,
    "customerEmail" TEXT NOT NULL,
    "customerName" TEXT,
    "productId" TEXT NOT NULL,
    "productTitle" TEXT NOT NULL,
    "productImage" TEXT,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "opened" BOOLEAN NOT NULL DEFAULT false,
    "clicked" BOOLEAN NOT NULL DEFAULT false,
    "responded" BOOLEAN NOT NULL DEFAULT false,
    "reminderCount" INTEGER NOT NULL DEFAULT 0,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReviewInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailSettings" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "mailtrapApiToken" TEXT,
    "mailtrapInboxId" TEXT,
    "fromEmail" TEXT NOT NULL DEFAULT 'reviews@yourstore.com',
    "fromName" TEXT NOT NULL DEFAULT 'Your Store',
    "externalApiUrl" TEXT,
    "rwsBaseUrl" TEXT,
    "autoSendEnabled" BOOLEAN NOT NULL DEFAULT false,
    "autoSendDaysAfter" INTEGER NOT NULL DEFAULT 7,
    "autoSendMaxReminders" INTEGER NOT NULL DEFAULT 2,
    "autoSendReminderDays" INTEGER NOT NULL DEFAULT 7,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewTemplate" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "subject" TEXT NOT NULL DEFAULT 'Como foi sua experiência com {{product_title}}?',
    "body" TEXT NOT NULL DEFAULT 'Olá {{customer_name}},

Esperamos que esteja satisfeito(a) com sua compra de {{product_title}}!

Gostaríamos muito de saber sua opinião. Clique no link abaixo para deixar sua avaliação:

{{review_link}}

Obrigado!',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReviewTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Review_shop_productId_idx" ON "Review"("shop", "productId");

-- CreateIndex
CREATE INDEX "Review_shop_published_idx" ON "Review"("shop", "published");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewSettings_shop_key" ON "ReviewSettings"("shop");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewInvitation_token_key" ON "ReviewInvitation"("token");

-- CreateIndex
CREATE INDEX "ReviewInvitation_shop_scheduledFor_idx" ON "ReviewInvitation"("shop", "scheduledFor");

-- CreateIndex
CREATE INDEX "ReviewInvitation_shop_sentAt_idx" ON "ReviewInvitation"("shop", "sentAt");

-- CreateIndex
CREATE INDEX "ReviewInvitation_token_idx" ON "ReviewInvitation"("token");

-- CreateIndex
CREATE UNIQUE INDEX "EmailSettings_shop_key" ON "EmailSettings"("shop");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewTemplate_shop_key" ON "ReviewTemplate"("shop");
