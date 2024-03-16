-- AlterTable
ALTER TABLE "Blog" ADD COLUMN     "date" TEXT NOT NULL DEFAULT DATE_TRUNC('day', CURRENT_DATE);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "catchphrase" TEXT;
