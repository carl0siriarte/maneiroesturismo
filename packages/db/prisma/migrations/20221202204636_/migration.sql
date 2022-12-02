/*
  Warnings:

  - You are about to drop the column `placeEventId` on the `Post` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_placeEventId_fkey";

-- AlterTable
ALTER TABLE "PlaceEvent" ADD COLUMN     "authorId" TEXT;

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "placeEventId";

-- AddForeignKey
ALTER TABLE "PlaceEvent" ADD CONSTRAINT "PlaceEvent_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
