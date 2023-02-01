-- DropForeignKey
ALTER TABLE "RolesOnUsers" DROP CONSTRAINT "RolesOnUsers_userId_fkey";

-- AddForeignKey
ALTER TABLE "RolesOnUsers" ADD CONSTRAINT "RolesOnUsers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Person"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
