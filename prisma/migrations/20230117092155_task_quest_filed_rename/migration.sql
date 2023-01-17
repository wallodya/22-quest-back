/*
  Warnings:

  - You are about to drop the column `typeName` on the `QuestType` table. All the data in the column will be lost.
  - You are about to drop the column `typeName` on the `TaskType` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `QuestType` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `TaskType` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `QuestType` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `TaskType` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "QuestType_typeName_key";

-- DropIndex
DROP INDEX "TaskType_typeName_key";

-- AlterTable
ALTER TABLE "QuestType" DROP COLUMN "typeName",
ADD COLUMN     "name" "TaskTypeEnum" NOT NULL;

-- AlterTable
ALTER TABLE "TaskType" DROP COLUMN "typeName",
ADD COLUMN     "name" "TaskTypeEnum" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "QuestType_name_key" ON "QuestType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TaskType_name_key" ON "TaskType"("name");
