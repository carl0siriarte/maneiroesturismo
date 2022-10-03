-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL,
    "secret" TEXT,
    "userId" TEXT
);

-- CreateTable
CREATE TABLE "Place" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" TEXT,
    "coverImage" TEXT
);

-- CreateTable
CREATE TABLE "PlaceData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data" TEXT NOT NULL,
    "placeId" TEXT NOT NULL
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
CREATE TABLE "Post" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "thumbnail" TEXT,
    "content" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "edited" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "placeEventId" TEXT
);

-- CreateTable
CREATE TABLE "PlaceMember" (
    "placeId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'regular',

    PRIMARY KEY ("memberId", "placeId")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "placeId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "TagsOnPost" (
    "tagId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,

    PRIMARY KEY ("postId", "tagId")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "CommentOnPost" (
    "commentId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,

    PRIMARY KEY ("postId", "commentId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_id_key" ON "Account"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_userId_key" ON "Account"("provider", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Place_slug_key" ON "Place"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "PlaceData_placeId_key" ON "PlaceData"("placeId");

-- CreateIndex
CREATE UNIQUE INDEX "PlaceEvent_placeId_slug_key" ON "PlaceEvent"("placeId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_placeId_key" ON "Tag"("name", "placeId");
