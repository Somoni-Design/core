/*
  Warnings:

  - You are about to drop the column `phone` on the `auth_codes` table. All the data in the column will be lost.
  - You are about to drop the column `isPhoneVerified` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `auth_codes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "auth_codes_phone_idx";

-- AlterTable
ALTER TABLE "auth_codes" DROP COLUMN "phone",
ADD COLUMN     "email" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "isPhoneVerified",
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "phone" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "auth_codes_email_idx" ON "auth_codes"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
