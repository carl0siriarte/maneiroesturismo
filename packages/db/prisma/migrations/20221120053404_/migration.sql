/*
  Warnings:

  - Added the required column `title` to the `PlaceEvent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PlaceEvent" ADD COLUMN     "title" TEXT NOT NULL;
