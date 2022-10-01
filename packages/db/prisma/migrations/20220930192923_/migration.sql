/*
  Warnings:

  - You are about to drop the column `customDomain` on the `Place` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Place" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" TEXT,
    "coverImage" TEXT
);
INSERT INTO "new_Place" ("coverImage", "createdAt", "id", "logo", "name", "slug", "updatedAt") SELECT "coverImage", "createdAt", "id", "logo", "name", "slug", "updatedAt" FROM "Place";
DROP TABLE "Place";
ALTER TABLE "new_Place" RENAME TO "Place";
CREATE UNIQUE INDEX "Place_slug_key" ON "Place"("slug");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
