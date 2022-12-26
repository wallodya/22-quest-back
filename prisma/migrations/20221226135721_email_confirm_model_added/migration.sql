/*
  Warnings:

  - Made the column `isEmailConfirmed` on table `Person` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Person" ALTER COLUMN "isEmailConfirmed" SET NOT NULL;

-- CreateTable
CREATE TABLE "EmailConfirmLink" (
    "emailConfirmLink_id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "link" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailConfirmLink_pkey" PRIMARY KEY ("emailConfirmLink_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailConfirmLink_userId_key" ON "EmailConfirmLink"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EmailConfirmLink_link_key" ON "EmailConfirmLink"("link");

-- AddForeignKey
ALTER TABLE "EmailConfirmLink" ADD CONSTRAINT "EmailConfirmLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Person"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
