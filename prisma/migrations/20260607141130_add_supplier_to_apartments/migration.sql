/*
  Warnings:

  - Added the required column `supplierId` to the `apartments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "apartments" ADD COLUMN     "supplierId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "apartments_supplierId_idx" ON "apartments"("supplierId");

-- AddForeignKey
ALTER TABLE "apartments" ADD CONSTRAINT "apartments_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
