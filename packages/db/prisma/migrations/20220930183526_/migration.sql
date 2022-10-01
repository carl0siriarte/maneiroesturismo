/*
  Warnings:

  - You are about to drop the column `favicon` on the `Place` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "PlaceData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data" TEXT NOT NULL,
    "placeId" TEXT NOT NULL
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Place" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "slug" TEXT NOT NULL,
    "customDomain" TEXT,
    "logo" TEXT,
    "coverImage" TEXT
);
INSERT INTO "new_Place" ("createdAt", "customDomain", "id", "logo", "name", "slug", "updatedAt") SELECT "createdAt", "customDomain", "id", "logo", "name", "slug", "updatedAt" FROM "Place";
DROP TABLE "Place";
ALTER TABLE "new_Place" RENAME TO "Place";
CREATE UNIQUE INDEX "Place_slug_key" ON "Place"("slug");
CREATE UNIQUE INDEX "Place_customDomain_key" ON "Place"("customDomain");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "PlaceData_placeId_key" ON "PlaceData"("placeId");
