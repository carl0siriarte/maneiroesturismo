/*
  Warnings:

  - You are about to drop the column `placeEventId` on the `EventConfirmation` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "EventConfirmation" DROP CONSTRAINT "EventConfirmation_eventId_fkey";

-- DropForeignKey
ALTER TABLE "EventConfirmation" DROP CONSTRAINT "EventConfirmation_placeEventId_fkey";

-- AlterTable
ALTER TABLE "EventConfirmation" DROP COLUMN "placeEventId";

-- AddForeignKey
ALTER TABLE "EventConfirmation" ADD CONSTRAINT "EventConfirmation_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "PlaceEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
