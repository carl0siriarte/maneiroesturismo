-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Tourist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "placeId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL,
    "secret" TEXT,
    "touristId" TEXT,
    "userId" TEXT
);

-- CreateTable
CREATE TABLE "Place" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "slug" TEXT NOT NULL,
    "customDomain" TEXT,
    "logo" TEXT,
    "favicon" TEXT
);

-- CreateTable
CREATE TABLE "PlaceEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "thumbnail" TEXT,
    "content" TEXT,
    "slug" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PlaceShortPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "thumbnail" TEXT,
    "content" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "placeEventId" TEXT
);

-- CreateTable
CREATE TABLE "PlaceMember" (
    "placeId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'normal',

    PRIMARY KEY ("memberId", "placeId")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "placeId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "TagsOnShortPost" (
    "tagId" TEXT NOT NULL,
    "placeShortPostId" TEXT NOT NULL,

    PRIMARY KEY ("placeShortPostId", "tagId")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "touristId" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "CommentOnShortPost" (
    "commentId" TEXT NOT NULL,
    "placeShortPostId" TEXT NOT NULL,

    PRIMARY KEY ("placeShortPostId", "commentId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Tourist_id_key" ON "Tourist"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Tourist_email_placeId_key" ON "Tourist"("email", "placeId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_id_key" ON "Account"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_touristId_key" ON "Account"("provider", "touristId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_userId_key" ON "Account"("provider", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Place_slug_key" ON "Place"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Place_customDomain_key" ON "Place"("customDomain");

-- CreateIndex
CREATE UNIQUE INDEX "PlaceEvent_placeId_slug_key" ON "PlaceEvent"("placeId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "PlaceShortPost_placeId_slug_key" ON "PlaceShortPost"("placeId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_placeId_key" ON "Tag"("name", "placeId");
