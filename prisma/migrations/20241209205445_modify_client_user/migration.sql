/*
  Warnings:

  - You are about to drop the `Admin` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Boutiquier` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Admin" DROP CONSTRAINT "Admin_userId_fkey";

-- DropForeignKey
ALTER TABLE "Boutiquier" DROP CONSTRAINT "Boutiquier_userId_fkey";

-- DropTable
DROP TABLE "Admin";

-- DropTable
DROP TABLE "Boutiquier";
