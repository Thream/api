/*
  Warnings:

  - You are about to alter the column `name` on the `Channel` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(20)`.
  - You are about to alter the column `name` on the `Guild` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(30)`.
  - You are about to alter the column `type` on the `Message` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(10)`.
  - You are about to alter the column `mimetype` on the `Message` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(127)`.
  - You are about to alter the column `provider` on the `OAuth` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(20)`.
  - You are about to alter the column `name` on the `User` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(30)`.
  - You are about to alter the column `email` on the `User` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(254)`.
  - You are about to alter the column `status` on the `User` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(50)`.
  - You are about to alter the column `biography` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(160)`.
  - You are about to alter the column `language` on the `UserSetting` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(10)`.
  - You are about to alter the column `theme` on the `UserSetting` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(10)`.
  - A unique constraint covering the columns `[guildId]` on the table `Channel` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `Member` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[guildId]` on the table `Member` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[memberId]` on the table `Message` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[channelId]` on the table `Message` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `OAuth` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `RefreshToken` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Channel" ALTER COLUMN "name" SET DATA TYPE VARCHAR(20);

-- AlterTable
ALTER TABLE "Guild" ALTER COLUMN "name" SET DATA TYPE VARCHAR(30);

-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "type" SET DATA TYPE VARCHAR(10),
ALTER COLUMN "mimetype" SET DATA TYPE VARCHAR(127);

-- AlterTable
ALTER TABLE "OAuth" ALTER COLUMN "provider" SET DATA TYPE VARCHAR(20);

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "name" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "email" SET DATA TYPE VARCHAR(254),
ALTER COLUMN "status" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "biography" SET DATA TYPE VARCHAR(160);

-- AlterTable
ALTER TABLE "UserSetting" ALTER COLUMN "language" SET DEFAULT E'en',
ALTER COLUMN "language" SET DATA TYPE VARCHAR(10),
ALTER COLUMN "theme" SET DEFAULT E'dark',
ALTER COLUMN "theme" SET DATA TYPE VARCHAR(10);

-- CreateIndex
CREATE UNIQUE INDEX "Channel_guildId_key" ON "Channel"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "Member_userId_key" ON "Member"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Member_guildId_key" ON "Member"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "Message_memberId_key" ON "Message"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "Message_channelId_key" ON "Message"("channelId");

-- CreateIndex
CREATE UNIQUE INDEX "OAuth_userId_key" ON "OAuth"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_userId_key" ON "RefreshToken"("userId");
