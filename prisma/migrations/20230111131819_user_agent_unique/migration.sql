/*
  Warnings:

  - A unique constraint covering the columns `[userAgent]` on the table `Token` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Token_userAgent_key" ON "Token"("userAgent");
