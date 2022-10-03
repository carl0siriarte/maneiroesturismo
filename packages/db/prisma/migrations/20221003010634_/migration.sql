/*
  Warnings:

  - Added the required column `updatedAt` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Post" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "thumbnail" TEXT,
    "content" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "edited" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "placeEventId" TEXT
);
INSERT INTO "new_Post" ("content", "createdAt", "edited", "id", "placeEventId", "placeId", "thumbnail") SELECT "content", "createdAt", "edited", "id", "placeEventId", "placeId", "thumbnail" FROM "Post";
DROP TABLE "Post";
ALTER TABLE "new_Post" RENAME TO "Post";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
