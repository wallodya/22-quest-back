-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_questId_fkey";

-- AlterTable
ALTER TABLE "Task" ALTER COLUMN "questId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_questId_fkey" FOREIGN KEY ("questId") REFERENCES "Quest"("quest_id") ON DELETE SET NULL ON UPDATE CASCADE;
