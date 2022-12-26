/*
  Warnings:

  - You are about to drop the column `hasPreferencesSync` on the `Person` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `Person` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "RoleEnum" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "TaskTypeEnum" AS ENUM ('BASIC', 'PERIODIC', 'TIMER');

-- CreateEnum
CREATE TYPE "QuestTypeEnum" AS ENUM ('BASIC', 'CONTINIOUS');

-- AlterTable
ALTER TABLE "Person" DROP COLUMN "hasPreferencesSync";

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "roleName" "RoleEnum" NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolesOnUsers" (
    "rolesOnnUsers_id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,
    "assignedById" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RolesOnUsers_pkey" PRIMARY KEY ("rolesOnnUsers_id")
);

-- CreateTable
CREATE TABLE "Token" (
    "token_id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "refeshToken" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("token_id")
);

-- CreateTable
CREATE TABLE "Preference" (
    "preference_id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "hasPreferencesSync" BOOLEAN NOT NULL,
    "hasDarkMode" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Preference_pkey" PRIMARY KEY ("preference_id")
);

-- CreateTable
CREATE TABLE "Task" (
    "task_id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "uniqueTaskId" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT NOT NULL,
    "text" TEXT,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "priority" INTEGER NOT NULL DEFAULT 2,
    "difficulty" INTEGER NOT NULL DEFAULT 2,
    "isInQuest" BOOLEAN NOT NULL DEFAULT false,
    "questId" INTEGER NOT NULL,
    "isCurrentInQuest" BOOLEAN,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("task_id")
);

-- CreateTable
CREATE TABLE "TaskType" (
    "taskType_id" SERIAL NOT NULL,
    "typeName" "TaskTypeEnum" NOT NULL,
    "description" TEXT NOT NULL,
    "createdat" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaskType_pkey" PRIMARY KEY ("taskType_id")
);

-- CreateTable
CREATE TABLE "TaskTypeOnTask" (
    "taskTypeOnTask_id" SERIAL NOT NULL,
    "taskId" INTEGER NOT NULL,
    "taskTypeId" INTEGER NOT NULL,

    CONSTRAINT "TaskTypeOnTask_pkey" PRIMARY KEY ("taskTypeOnTask_id")
);

-- CreateTable
CREATE TABLE "Quest" (
    "quest_id" SERIAL NOT NULL,
    "uniqueQuestId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isStarted" BOOLEAN NOT NULL DEFAULT false,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "authorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quest_pkey" PRIMARY KEY ("quest_id")
);

-- CreateTable
CREATE TABLE "QuestType" (
    "questType_id" SERIAL NOT NULL,
    "typeName" "TaskTypeEnum" NOT NULL,
    "description" TEXT NOT NULL,
    "createdat" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestType_pkey" PRIMARY KEY ("questType_id")
);

-- CreateTable
CREATE TABLE "QuestTypeOnQuests" (
    "questTypeOnQuest_id" SERIAL NOT NULL,
    "questTypeId" INTEGER NOT NULL,
    "questId" INTEGER NOT NULL,

    CONSTRAINT "QuestTypeOnQuests_pkey" PRIMARY KEY ("questTypeOnQuest_id")
);

-- CreateTable
CREATE TABLE "QuestsOnUsers" (
    "questOnUsers_id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "questId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestsOnUsers_pkey" PRIMARY KEY ("questOnUsers_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RolesOnUsers_userId_roleId_key" ON "RolesOnUsers"("userId", "roleId");

-- CreateIndex
CREATE UNIQUE INDEX "Task_uniqueTaskId_key" ON "Task"("uniqueTaskId");

-- CreateIndex
CREATE UNIQUE INDEX "Task_userId_title_key" ON "Task"("userId", "title");

-- CreateIndex
CREATE UNIQUE INDEX "TaskType_typeName_key" ON "TaskType"("typeName");

-- CreateIndex
CREATE UNIQUE INDEX "TaskType_description_key" ON "TaskType"("description");

-- CreateIndex
CREATE UNIQUE INDEX "TaskTypeOnTask_taskId_taskTypeId_key" ON "TaskTypeOnTask"("taskId", "taskTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "Quest_uniqueQuestId_key" ON "Quest"("uniqueQuestId");

-- CreateIndex
CREATE UNIQUE INDEX "Quest_authorId_title_key" ON "Quest"("authorId", "title");

-- CreateIndex
CREATE UNIQUE INDEX "QuestType_typeName_key" ON "QuestType"("typeName");

-- CreateIndex
CREATE UNIQUE INDEX "QuestType_description_key" ON "QuestType"("description");

-- CreateIndex
CREATE UNIQUE INDEX "QuestTypeOnQuests_questId_questTypeId_key" ON "QuestTypeOnQuests"("questId", "questTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "QuestsOnUsers_userId_questId_key" ON "QuestsOnUsers"("userId", "questId");

-- CreateIndex
CREATE UNIQUE INDEX "Person_email_key" ON "Person"("email");

-- AddForeignKey
ALTER TABLE "RolesOnUsers" ADD CONSTRAINT "RolesOnUsers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Person"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolesOnUsers" ADD CONSTRAINT "RolesOnUsers_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolesOnUsers" ADD CONSTRAINT "RolesOnUsers_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "Person"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Person"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Preference" ADD CONSTRAINT "Preference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Person"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Person"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_questId_fkey" FOREIGN KEY ("questId") REFERENCES "Quest"("quest_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskTypeOnTask" ADD CONSTRAINT "TaskTypeOnTask_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("task_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskTypeOnTask" ADD CONSTRAINT "TaskTypeOnTask_taskTypeId_fkey" FOREIGN KEY ("taskTypeId") REFERENCES "TaskType"("taskType_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quest" ADD CONSTRAINT "Quest_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Person"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestTypeOnQuests" ADD CONSTRAINT "QuestTypeOnQuests_questTypeId_fkey" FOREIGN KEY ("questTypeId") REFERENCES "QuestType"("questType_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestTypeOnQuests" ADD CONSTRAINT "QuestTypeOnQuests_questId_fkey" FOREIGN KEY ("questId") REFERENCES "Quest"("quest_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestsOnUsers" ADD CONSTRAINT "QuestsOnUsers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Person"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestsOnUsers" ADD CONSTRAINT "QuestsOnUsers_questId_fkey" FOREIGN KEY ("questId") REFERENCES "Quest"("quest_id") ON DELETE RESTRICT ON UPDATE CASCADE;
