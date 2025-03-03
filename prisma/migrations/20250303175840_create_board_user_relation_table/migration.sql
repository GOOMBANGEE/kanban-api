/*
  Warnings:

  - A unique constraint covering the columns `[invite_code]` on the table `Board` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "BoardUserRelation" (
    "board_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,

    CONSTRAINT "BoardUserRelation_pkey" PRIMARY KEY ("board_id","user_id")
);

-- CreateIndex
CREATE INDEX "BoardUserRelation_board_id_idx" ON "BoardUserRelation"("board_id");

-- CreateIndex
CREATE INDEX "BoardUserRelation_user_id_idx" ON "BoardUserRelation"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Board_invite_code_key" ON "Board"("invite_code");
