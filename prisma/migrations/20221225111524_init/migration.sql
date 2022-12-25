-- CreateTable
CREATE TABLE "Person" (
    "user_id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "login" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "isEmailConfirmed" BOOLEAN DEFAULT false,
    "dateOfBirth" TIMESTAMP(3),
    "hasPreferencesSync" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Person_uuid_key" ON "Person"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Person_login_key" ON "Person"("login");
