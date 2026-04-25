-- CreateEnum
CREATE TYPE "OAuthProviderType" AS ENUM ('GOOGLE', 'LINE');

-- CreateEnum
CREATE TYPE "GenderType" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'zh-TW',
    "password" TEXT,
    "last_login_at" TIMESTAMP(3),
    "email" TEXT,
    "email_verified_at" TIMESTAMP(3),
    "phone_number" TEXT,
    "phone_number_verified_at" TIMESTAMP(3),
    "gender" "GenderType",
    "birthday" TIMESTAMP(3),
    "country" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_oauth" (
    "id" TEXT NOT NULL,
    "oauth_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider" "OAuthProviderType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_oauth_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_oauth_oauth_id_key" ON "user_oauth"("oauth_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_oauth_user_id_provider_key" ON "user_oauth"("user_id", "provider");

-- AddForeignKey
ALTER TABLE "user_oauth" ADD CONSTRAINT "user_oauth_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
