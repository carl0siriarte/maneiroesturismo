/*
  Warnings:

  - Made the column `name` on table `Place` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Place" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
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
