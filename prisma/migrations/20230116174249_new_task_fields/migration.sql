/*
  Warnings:

  - Added the required column `duration` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `repeatTimes` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "duration" INTEGER NOT NULL,
ADD COLUMN     "repeatTimes" INTEGER NOT NULL;
