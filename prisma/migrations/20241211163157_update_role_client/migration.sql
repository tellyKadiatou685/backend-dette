/*
  Warnings:

  - The values [USER] on the enum `RoleType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RoleType_new" AS ENUM ('ADMIN', 'BOUTIQUIER', 'CLIENT');
ALTER TABLE "Role" ALTER COLUMN "nomRole" TYPE "RoleType_new" USING ("nomRole"::text::"RoleType_new");
ALTER TYPE "RoleType" RENAME TO "RoleType_old";
ALTER TYPE "RoleType_new" RENAME TO "RoleType";
DROP TYPE "RoleType_old";
COMMIT;
