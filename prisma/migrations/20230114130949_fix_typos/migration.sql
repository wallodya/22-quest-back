/*
  Warnings:

  - You are about to drop the column `roleName` on the `Role` table. All the data in the column will be lost.
  - The primary key for the `RolesOnUsers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `rolesOnnUsers_id` on the `RolesOnUsers` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Role` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Role` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Role_roleName_key";

-- AlterTable
ALTER TABLE "Role" DROP COLUMN "roleName",
ADD COLUMN     "name" "RoleEnum" NOT NULL;

-- AlterTable
ALTER TABLE "RolesOnUsers" DROP CONSTRAINT "RolesOnUsers_pkey",
DROP COLUMN "rolesOnnUsers_id",
ADD COLUMN     "rolesOnUsers_id" SERIAL NOT NULL,
ADD CONSTRAINT "RolesOnUsers_pkey" PRIMARY KEY ("rolesOnUsers_id");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");
