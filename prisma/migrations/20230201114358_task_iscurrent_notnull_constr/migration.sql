/*
  Warnings:

  - Made the column `isCurrentInQuest` on table `Task` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Task" ALTER COLUMN "isCurrentInQuest" SET NOT NULL,
ALTER COLUMN "isCurrentInQuest" SET DEFAULT false;
