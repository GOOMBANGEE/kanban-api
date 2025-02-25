/*
  Warnings:

  - You are about to drop the column `group_id` on the `Status` table. All the data in the column will be lost.
  - You are about to drop the column `group_id` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the `Group` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `group` to the `Status` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Status_group_id_idx";

-- DropIndex
DROP INDEX "Ticket_group_id_idx";

-- AlterTable
ALTER TABLE "Status" DROP COLUMN "group_id",
ADD COLUMN     "group" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "group_id";

-- DropTable
DROP TABLE "Group";
