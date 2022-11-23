/*
  Warnings:

  - You are about to drop the column `slug` on the `PlaceEvent` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnail` on the `PlaceEvent` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "PlaceEvent_placeId_slug_key";

-- AlterTable
ALTER TABLE "PlaceEvent" DROP COLUMN "slug",
DROP COLUMN "thumbnail";
