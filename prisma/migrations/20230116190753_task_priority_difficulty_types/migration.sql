/*
  Warnings:

  - The `priority` column on the `Task` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `difficulty` column on the `Task` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Task" DROP COLUMN "priority",
ADD COLUMN     "priority" "TaskPriorityEnum" NOT NULL DEFAULT 'MEDIUM',
DROP COLUMN "difficulty",
ADD COLUMN     "difficulty" "TaskDifficultyEnum" NOT NULL DEFAULT 'MEDIUM';
