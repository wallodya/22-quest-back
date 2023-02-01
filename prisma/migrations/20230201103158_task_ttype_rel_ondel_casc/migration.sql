-- DropForeignKey
ALTER TABLE "TaskTypeOnTask" DROP CONSTRAINT "TaskTypeOnTask_taskId_fkey";

-- AlterTable
ALTER TABLE "Quest" ALTER COLUMN "startedAt" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "TaskTypeOnTask" ADD CONSTRAINT "TaskTypeOnTask_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("task_id") ON DELETE CASCADE ON UPDATE CASCADE;
