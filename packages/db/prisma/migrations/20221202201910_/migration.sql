/*
  Warnings:

  - You are about to drop the `Tag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TagsOnPost` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Tag" DROP CONSTRAINT "Tag_placeId_fkey";

-- DropForeignKey
ALTER TABLE "TagsOnPost" DROP CONSTRAINT "TagsOnPost_postId_fkey";

-- DropForeignKey
ALTER TABLE "TagsOnPost" DROP CONSTRAINT "TagsOnPost_tagId_fkey";

-- AlterTable
ALTER TABLE "PlaceEvent" ADD COLUMN     "isProposal" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "authorId" TEXT;

-- DropTable
DROP TABLE "Tag";

-- DropTable
DROP TABLE "TagsOnPost";

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contactData" JSONB,
    "data" TEXT,
    "type" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "userId" TEXT,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventConfirmation" (
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "placeEventId" TEXT,

    CONSTRAINT "EventConfirmation_pkey" PRIMARY KEY ("userId","eventId")
);

-- AddForeignKey
ALTER TABLE "ContactMessage" ADD CONSTRAINT "ContactMessage_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactMessage" ADD CONSTRAINT "ContactMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventConfirmation" ADD CONSTRAINT "EventConfirmation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventConfirmation" ADD CONSTRAINT "EventConfirmation_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventConfirmation" ADD CONSTRAINT "EventConfirmation_placeEventId_fkey" FOREIGN KEY ("placeEventId") REFERENCES "PlaceEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
