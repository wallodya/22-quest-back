/*
  Warnings:

  - You are about to drop the `QuestsOnUsers` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userId` to the `Quest` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "QuestsOnUsers" DROP CONSTRAINT "QuestsOnUsers_questId_fkey";

-- DropForeignKey
ALTER TABLE "QuestsOnUsers" DROP CONSTRAINT "QuestsOnUsers_userId_fkey";

-- AlterTable
ALTER TABLE "Quest" ADD COLUMN     "userId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "QuestsOnUsers";

-- AddForeignKey
ALTER TABLE "Quest" ADD CONSTRAINT "Quest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Person"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
