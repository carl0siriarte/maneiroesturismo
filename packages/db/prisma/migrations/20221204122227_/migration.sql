-- CreateTable
CREATE TABLE "CommentOnEvent" (
    "commentId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "CommentOnEvent_pkey" PRIMARY KEY ("eventId","commentId")
);

-- AddForeignKey
ALTER TABLE "CommentOnEvent" ADD CONSTRAINT "CommentOnEvent_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentOnEvent" ADD CONSTRAINT "CommentOnEvent_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "PlaceEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
